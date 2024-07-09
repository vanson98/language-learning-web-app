<template>
  <el-row style="height: 5%;">
    <el-col :span="4">
      <el-input v-model="searchText" placeholder="Serch Phrase" @keyup.enter="getLessonWord"></el-input>
    </el-col>
    <el-col :span="2">
      <div class="ms-5">
        <el-button @click="getLessonWord" type="primary">Load Data</el-button>
      </div>
    </el-col>
    <el-col :span="2">
      <div class="ms-5">
        <el-button @click="highLightAllWord" type="warning">Highlight All</el-button>
      </div>
    </el-col>
  </el-row>
  <el-row style="height: 95%;">
    <el-col :span="15" style="height: 100%;">
      <!-- <el-table :data="lessonWords" ref="singleTableRef" style="width: 100%; height: 85vh" highlight-current-row
        :row-key="'NoteId'" @current-change="handleCurrentRowChange">
        <el-table-column type="index" width="50" />
        <el-table-column property="Context" label="Context" min-width="200">
          <template #default="scope">
            <p v-html="scope.row.Context"></p>
            <audio :id="'card-audio-' + scope.row.NoteId" preload="auto">
              <source :src="SERVER_BASE_URL + '/audio?fileName=' + scope.row.AudioFileName
                " type="audio/mpeg" />
            </audio>
            <audio :id="'word-voice-' + scope.row.NoteId" preload="auto">
              <source :src="SERVER_BASE_URL +
                '/word-voice?fileName=' +
                scope.row.Lemma +
                '.mp3'
                " type="audio/mpeg" />
            </audio>
          </template>
</el-table-column>
</el-table> -->
      <el-auto-resizer>
        <template #default="{ height, width }">
          <el-table-v2 :columns="columns" :data="lessonWords" :width="width" :height="height" :sort-by="sortState"
            @column-sort="onSort" fixed>

          </el-table-v2>
        </template>
      </el-auto-resizer>


    </el-col>
    <el-col :span="9" v-if="currentRow != null">
      <div class="word-info-box">
        <div>
          <div class="mt-2">
            <label>Lemma</label>
            <el-input v-model="currentRow.Lemma"></el-input>
          </div>
          <!-- <div class="mt-2">
            <label>Word</label>
            <el-input v-model="currentRow.Word"></el-input>
          </div> -->
          <div class="mt-2">
            <label>IPA</label>
            <el-input v-model="currentRow.IPA"></el-input>
          </div>

          <div class="mt-2">
            <label>Word Definition</label>
            <el-input autosize type="textarea" v-model="currentRow.WordDefinition"></el-input>
          </div>

          <div class="mt-2">
            <label>Type</label>
            <el-input @keydown.enter="goToNextWord" v-model="typeText"></el-input>
          </div>
          <div class="mt-2">
            <div class="d-flex justify-content-start">
              <label>Context</label>
              <div class="ms-5 mb-2 d-flex justify-content-between flex-grow-1">
                <div>
                  <el-button @click="() => playContextAudio(null)" type="primary">Replay Audio</el-button>
                </div>
                <div>
                  <el-button @click="highLightWord" type="warning">Highlight</el-button>
                </div>
                <div>
                  <el-button @click="() => deleteWord(currentRow!.NoteId)" type="danger">Remove</el-button>
                </div>
              </div>
            </div>
            <QuillEditor v-model:content="currentRow.Context" toolbar="minimal" content-type="html"
              style="margin-bottom: 2px">
            </QuillEditor>
          </div>
          <div class="d-flex justify-content-between">
            <div>
              <el-tag v-for="tag in currentRow.Tags">{{ tag }}</el-tag>
            </div>
          </div>
          <div class="mt-2">
            <label>Context Translation</label>
            <QuillEditor v-model:content="currentRow.ContextTranslation" toolbar="#context-toolbar2"
              content-type="html">
              <template #toolbar>
                <div id="context-toolbar2" class="my-toolbar"></div>
              </template>
            </QuillEditor>
          </div>

          <br />
        </div>

        <div class="card-images">
          <img :src="SERVER_BASE_URL + '/image?fileName=' + currentRow.ImageFileName
            " />
        </div>
        <hr />

      </div>
    </el-col>
  </el-row>
</template>

<script lang="ts" setup>
import {
  ElTag,
  ElMessage,
  ElTable,
  ElRow,
  ElCol,
  ElInput,
  ElMessageBox,
  ElTableColumn,
  ElButton,
  ElTableV2,
  ElAutoResizer,
  SortBy,
  TableV2SortOrder
} from "element-plus";
import SERVER_BASE_URL from "../../libs/url";
import LessonWordModel from "../../models/lesson/LessonWordModel";
import { onMounted, ref } from "vue";
import ajax from "@/libs/ajax";
import AnkiResponseModel from "@/models/response/AnkiResponseModel";
import moment from "moment";
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";

const props = defineProps<{
  videoId: string;
  autoPlayAudio: boolean;
  voiceType: string;
}>();

const searchText = ref<string>("");
const currentRow = ref<LessonWordModel | null>(null);
const singleTableRef = ref<InstanceType<typeof ElTable>>();
const lessonWords = ref<LessonWordModel[]>([]);
const typeText = ref<string | null>("")
const sortState = ref<SortBy>({
  key: 'Lemma',
  order: TableV2SortOrder.ASC,
})

const columns = [
  {
    key: "Index",
    dataKey: "Index",
    title: "Index",
    width: 75
  },
  {
    key: "Lemma",
    dataKey: "Lemma",
    title: "Word",
    sortable: true,
    width: 150
  },
  {
    key: "IPA",
    dataKey: "IPA",
    title: "IPA",
    width: 150
  },
  {
    key: "WordDefinition",
    dataKey: "WordDefinition",
    title: "Word Definition",
    width: 250
  },
  {
    key: "action",
    dataKey: "action",
    title: "Action",
    width: 100
  }
]


onMounted(() => {
  getLessonWord();
});

const getLessonWord = () => {
  ajax
    .get<AnkiResponseModel>(
      `/lesson-words?vid=${props.videoId}&searchText=${searchText.value}`
    )
    .then((res) => {
      if (res.data.error != null) {
        ElMessage({
          message: res.data.error,
          type: "error",
        });
        return;
      }
      if (res.data.result != null) {
        lessonWords.value = [];
        res.data?.result.forEach((item: any) => {
          lessonWords.value.push({
            CardId: item.cards[0],
            AudioFileName: item["fields"]["Audio clip media filename"]
              .value as string,
            Context: item["fields"].Context.value,
            ContextTranslation: item["fields"]["Context translation"]
              .value as string,
            DateCreated: moment(
              item["fields"]["Date created"].value as string,
              "YYYY-MM-DD hh:mm"
            ).toDate(),
            IPA: item["fields"]["IPA"].value,
            Lemma: item["fields"]["Lemma"].value,
            ImageFileName: item["fields"]["Next Image media filename"].value,
            Word: item["fields"]["Word"].value,
            WordDefinition: item["fields"]["Word definition"].value,
            NoteId: item.noteId,
            Tags: item.tags,
          });
        });
        sortWordByLemmaAsc()
        singleTableRef.value?.doLayout();
      }
    })
    .catch((res) => {
      console.log(res);
    });
};

const handleCurrentRowChange = (
  crtRow: LessonWordModel,
  previousRow: LessonWordModel
) => {
  currentRow.value = crtRow;
  onCurrentRowChange(previousRow);
};

const onCurrentRowChange = (prevRow: LessonWordModel | null) => {
  if (prevRow) {
    updateLRWord(prevRow);
  }
  playMedia(prevRow);
};

const playMedia = (prevRow: LessonWordModel | null) => {
  if (props.autoPlayAudio && props.voiceType == "Context") {
    playContextAudio(prevRow);
  }
  if (props.autoPlayAudio && props.voiceType == "Word") {
    playWordVoice();
  }
};

const updateLRWord = (lrWord: LessonWordModel) => {
  ajax
    .post<AnkiResponseModel>(
      "/lr-word",
      JSON.stringify({
        NoteId: lrWord.NoteId,
        Lemma: lrWord.Lemma,
        Word: lrWord.Word,
        IPA: lrWord.IPA,
        "Word definition": lrWord.WordDefinition,
        Context: lrWord.Context,
        "Context translation": lrWord.ContextTranslation,
      })
    )
    .then((res) => { })
    .catch((res) => {
      console.error(res);
    });
};

const highLightAllWord = () => {
  lessonWords.value.forEach((item) => {
    if (!item.Context.includes("</span>")) {
      item.Context = item.Context.replace(
        item.Word,
        `<span style="background-color: rgb(255, 170, 0);">${item.Word}</span>`
      );
      item.Context = "<p>" + item.Context + "</p>";
    }
  });
  saveHighlightWords();
};

const saveHighlightWords = () => {
  let wordContextList = lessonWords.value.map(({ NoteId, Context }) => ({
    NoteId,
    Context,
  }));
  ElMessageBox.confirm("Note data is gonna change. Are you sure?", "Warning", {
    confirmButtonText: "Update",
    cancelButtonText: "Cancel",
    type: "warning",
  })
    .then(() => {
      ajax
        .post("/highlight-words", JSON.stringify(wordContextList))
        .then((res) => {
          if (res.status === 200) {
            ElMessage({
              type: "success",
              message: "All notes are highlighted",
            });
          }
        });
    })
    .catch(() => { });
};

const deleteWord = (noteId: string) => {
  ElMessageBox.confirm("Permanently delete the word. Continue?", "Warning", {
    confirmButtonText: "OK",
    cancelButtonText: "Cancel",
    type: "warning",
  })
    .then(() => {
      ajax
        .get<AnkiResponseModel>(
          `delete-note?noteId=${noteId}&audioFileName=${currentRow.value?.AudioFileName}&prevImageFileName=${currentRow.value?.ImageFileName}`
        )
        .then((res) => {
          if (res.data.error == null) {
            ElMessage({
              type: "success",
              message: "Delete completed",
            });
            lessonWords.value = lessonWords.value.filter(
              (wordItem) => wordItem.NoteId != currentRow.value?.NoteId
            );
          }
        })
        .catch((res) => {
          console.error(res);
        });
    })
    .catch(() => { });
};

const playContextAudio = (previousRow: LessonWordModel | null) => {
  var currentAudioElement = document.getElementById(
    "card-audio-" + currentRow.value?.NoteId
  ) as HTMLAudioElement;
  var previousAudioElement = document.getElementById(
    "card-audio-" + previousRow?.NoteId
  );
  if (previousAudioElement instanceof HTMLAudioElement) {
    previousAudioElement.pause();
  }
  currentAudioElement.play();
};

const playWordVoice = () => {
  var currentAudioElement = document.getElementById(
    "word-voice-" + currentRow.value?.NoteId
  ) as HTMLAudioElement;
  if (currentAudioElement != null) {
    currentAudioElement.play().then((_) => {
      setTimeout(() => {
        currentAudioElement.pause();
      }, 2000);
    });
  }
};

const highLightWord = () => {
  var selectText = window.getSelection()?.toString();
  if (currentRow.value != null && selectText != null) {
    var highlightText = `<span style="background-color: rgb(255, 170, 0);">${selectText}</span>`;
    currentRow.value.Context = currentRow.value.Context.replace(
      selectText,
      highlightText
    );
  }
};

window.addEventListener("keydown", (e) => {
  var targetElement = e.target as Element;
  if (
    !(targetElement instanceof HTMLInputElement) &&
    targetElement.className != "ql-editor" &&
    targetElement.className != "el-input__inner" &&
    targetElement.className != "el-textarea__inner"
  ) {
    if (e.key == "ArrowDown") {
      goToNextWord()
    }
    if (e.key == "ArrowUp") {
      goToPreviousWord()
    }
    if (e.key == "r") {
      playMedia(null);
    }
  }

  if (e.altKey && e.key == "a" && targetElement.className == "ql-editor") {
    highLightWord();
  }
});

const goToNextWord = () => {
  if (currentRow.value != null) {
    var currentRowIndex = lessonWords.value.indexOf(currentRow.value);
    if (currentRowIndex == lessonWords.value.length - 1) {
      return;
    }
    singleTableRef.value?.setCurrentRow(
      lessonWords.value[currentRowIndex + 1]
    );
    typeText.value = null
  }
}

const goToPreviousWord = () => {
  if (currentRow.value != null) {
    var currentRowIndex = lessonWords.value.indexOf(currentRow.value);
    if (currentRowIndex == 0) {
      return;
    }
    singleTableRef.value?.setCurrentRow(
      lessonWords.value[currentRowIndex - 1]
    );
  }
}

const onSort = (sortBy: SortBy) => {
  if(sortBy.order == 'asc'){
    sortWordByLemmaAsc()
  }else{
    sortWordByLemmaDesc()
  }
  sortState.value = sortBy
}

const sortWordByLemmaAsc = () =>{
  lessonWords.value.sort((a,b)=>a.Lemma.localeCompare(b.Lemma))
  lessonWords.value.forEach((obj,index)=>{
    obj.Index = index+1
  })
}

const sortWordByLemmaDesc = () =>{
  lessonWords.value.sort((a,b)=>b.Lemma.localeCompare(a.Lemma))
  lessonWords.value.forEach((obj,index)=>{
    obj.Index = index+1
  })
}
</script>

<style>
.word-info-box {
  width: 100%;
  height: 90vh;
  border: 1px solid;
  padding: 10px;
  overflow: scroll;
}
</style>
