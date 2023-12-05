<template>
  <el-row>
    <el-col :span="4">
      <el-input v-model="searchText" placeholder="Serch Phrase" @keyup.enter="getLessonWord"></el-input>
     
    </el-col>
    <el-col :span="4">
      <el-button @click="getLessonWord">Reload Data</el-button>
    </el-col>
  </el-row>
  <el-row>

    <el-col :span="14">
      <el-table :data="lessonWords" ref="singleTableRef" style="width: 100%;height: 85vh;" highlight-current-row
        @current-change="handleCurrentRowChange">
        <el-table-column type="index" width="50" />
        <el-table-column property="Context" label="Context" min-width="200">
          <template #default="scope">
            <p v-html="scope.row.Context"></p>
            <audio :id="'card-audio-' + scope.row.NoteId">
              <source :src="SERVER_BASE_URL + '/audio?fileName=' + scope.row.AudioFileName" type="audio/mpeg">
            </audio>
          </template>
        </el-table-column>
      </el-table>
    </el-col>
    <el-col :span="10" v-if="currentRow != null">
      <div class="phrase-info-box">
        <div class="card-images">
          <img :src="SERVER_BASE_URL + '/image?fileName=' + currentRow.PrevImageFileName">
          <img :src="SERVER_BASE_URL + '/image?fileName=' + currentRow.NextImageFileName">
        </div>
        <hr>
        <div class="d-flex justify-content-end">
          <el-button @click="() => deleteWord(currentRow!.NoteId)" type="danger">Remove</el-button>
        </div>
        <hr>
        <div>
          <div class="mt-2">
            <label>Lemma</label>
            <el-input v-model="currentRow.Lemma"></el-input>
          </div>
          <div class="mt-2">
            <label>Word</label>
            <el-input v-model="currentRow.Word"></el-input>
          </div>
          <div class="mt-2">
            <label>IPA</label>
            <el-input v-model="currentRow.IPA"></el-input>
          </div>
          <div class="mt-2">
            <label>Word Definition</label>
            <el-input  autosize type="textarea" v-model="currentRow.WordDefinition"></el-input>
          </div>

          <div class="mt-2">
            <label>Context</label>
            <QuillEditor v-model:content="currentRow.Context" toolbar="full" content-type="html"
              style="margin-bottom: 2px;">

            </QuillEditor>
          </div>
          <div class="mt-2">
            <label>Context Translation</label>
            <QuillEditor v-model:content="currentRow.ContextTranslation" toolbar="#context-toolbar2" content-type="html">
              <template #toolbar>
                <div id="context-toolbar2" class="my-toolbar">
                </div>
              </template>
            </QuillEditor>
          </div>

          <br>
        </div>
      </div>
    </el-col>
  </el-row>
</template>

<script lang="ts" setup>
import { ElTag, ElMessage, ElTable, ElRow, ElCol, ElInput, ElMessageBox, ElTableColumn, ElButton } from 'element-plus'
import SERVER_BASE_URL from '../../libs/url'
import LessonWordModel from '../../models/lesson/LessonWordModel'
import { onMounted, ref } from 'vue';
import ajax from '@/libs/ajax';
import AnkiResponseModel from '@/models/response/AnkiResponseModel';
import moment from 'moment';
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css';

const props = defineProps<{
  videoId: string,
}>()

const searchText = ref<string>("")
const currentRow = ref<LessonWordModel | null>(null)
const singleTableRef = ref<InstanceType<typeof ElTable>>()
const lessonWords = ref<LessonWordModel[]>([])

onMounted(() => {
  getLessonWord();
})


const getLessonWord = () => {
  ajax.get<AnkiResponseModel>(`/lesson-words?vid=${props.videoId}&searchText=${searchText.value}`)
    .then(res => {
      if (res.data.error != null) {
        ElMessage({
          message: res.data.error,
          type: 'error',
        })
        return
      }
      if (res.data.result != null) {
        lessonWords.value = []
        res.data?.result.forEach((item: any) => {
          lessonWords.value.push({
            AudioFileName: item["fields"]["Audio clip media filename"].value as string,
            Context: item["fields"].Context.value,
            ContextTranslation: item["fields"]["Context translation"].value as string,
            DateCreated: moment(item["fields"]["Date created"].value as string, "YYYY-MM-DD hh:mm").toDate(),
            IPA: item["fields"]["IPA"].value,
            Lemma: item["fields"]["Lemma"].value,
            NextImageFileName: item["fields"]["Next Image media filename"].value,
            PrevImageFileName: item["fields"]["Previous Image media filename"].value,
            Word: item["fields"]["Word"].value,
            WordDefinition: item["fields"]["Word definition"].value,
            NoteId: item.noteId,
            Tags: item.tags
          })
        })
        lessonWords.value.sort((a, b): number => {
          if (a.DateCreated < b.DateCreated) {
            return -1
          } else if (a.DateCreated > b.DateCreated) {
            return 1
          }
          return 0
        })
      }
    })
    .catch(res => {
      console.log(res)
    })
}

const handleCurrentRowChange = (cr: LessonWordModel, ocr: LessonWordModel) => {
  currentRow.value = cr
  onCurrentPhraseRowChange(cr, ocr)
}

const onCurrentPhraseRowChange = (currectActivePhrase: LessonWordModel | null, oldActivePhrase: LessonWordModel | null) => {

  if (oldActivePhrase) {
    updateLRWord(oldActivePhrase)
  }
}


const updateLRWord = (lrWord: LessonWordModel) => {
  ajax.post<AnkiResponseModel>("/lr-word", JSON.stringify({
    NoteId: lrWord.NoteId,
    IPA: lrWord.IPA,
    "Word definition": lrWord.WordDefinition,
    Context: lrWord.Context,
    "Context translation": lrWord.ContextTranslation,
  })).then(res => {
  }).catch(res => {
    console.error(res)
  })
}

const deleteWord = (noteId: string) => {
  ElMessageBox.confirm(
    'Permanently delete the word. Continue?',
    'Warning',
    {
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel',
      type: 'warning',
    }
  )
    .then(() => {
      ajax.get<AnkiResponseModel>(`delete-note?noteId=${noteId}&audioFileName=${currentRow.value?.AudioFileName}&nextImageFileName=${currentRow.value?.NextImageFileName}&prevImageFileName=${currentRow.value?.PrevImageFileName}`).then(res => {
        if (res.data.error == null) {
          ElMessage({
            type: 'success',
            message: 'Delete completed',
          })
        }

      }).catch(res => {
        console.error(res)
      })
    }).catch(() => { })
}

window.addEventListener('keyup', (e) => {
  var targetElement = e.target;
  if ((targetElement instanceof HTMLInputElement)) {
    return
  }
  // if (e.key == 'ArrowRight' && carouselRef.value != null) {
  //   carouselRef.value.next()
  // }
  // if (e.key == 'ArrowLeft' && carouselRef.value != null) {
  //   carouselRef.value.prev()
  // }
  if (e.key == "r" || e.key == "R") {
    var audioElement = document.getElementById("card-audio-" + currentRow.value?.NoteId)
    if (audioElement instanceof HTMLAudioElement) {
      audioElement.play()
    }
  }
});
</script>