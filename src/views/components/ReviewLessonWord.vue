<template>
  <el-row style="height: 5%;">
    <el-col :span="4">
      <el-input v-model="searchText" placeholder="st: " @keyup.enter="filterWords"></el-input>
    </el-col>
    <el-col :span="8">
      <div class="action-control-ctn">
        <el-button @click="getLessonWord" type="primary">Load Data</el-button>
        <el-button @click="highLightAllWord" type="warning">Highlight All</el-button>
        <el-button @click="levelUpStatus" type="success">Status +1</el-button>
        <el-button @click="levelDownStatus" type="warning">Status -1</el-button>
      </div>
    </el-col>
    <el-col :span="12">
      <div class="word-status-ctn">
        <span>Total: {{ totalWord }} </span>
        <span>Upda: {{ updatedWord }}</span>
        <span>New: {{ newWordAmount }}</span>
        <span>Rec: {{ recognizedWordAmount }}</span>
        <span>Fam: {{ familiarWordAmount }}</span>
        <span>Ler: {{ learnedWordAmount }} </span>
        <span>Knw: {{ knownWordAmount }}</span>
      </div>
    </el-col>
  </el-row>
  <el-row style="height: 95%;">
    <el-col :span="15" style="height: 100%;">
      <!-- 
      <el-table :data="lessonWords" ref="singleTableRef" style="width: 100%; height: 85vh" highlight-current-row
        :row-key="'NoteId'" @current-change="handleCurrentRowChange">
        <el-table-column type="index" width="50" />
        <el-table-column property="Context" label="Context" min-width="200">
        </el-table-column>
      </el-table> 
      -->
      <el-auto-resizer>
        <template #default="{ height, width }">
          <el-table-v2 :columns="columns" :data="lessonWords" :width="width" :height="height" :sort-by="sortState"
            row-key="Index" @column-sort="onSort" :row-props="getRowProps" :row-class="rowClass" fixed
            ref="singleTableRef">
            <!-- Use the scoped slot to render the custom cell -->
            <template #header-cell="{ column }">
              <template v-if="column.key == 'selection'">
                <ElCheckbox :v-model:model-value="allSelected" @change="(value) => onAllRowSelectionChange(value)" />
              </template>
            </template>

            <template #cell="{ rowData, column, rowIndex }">
              <template v-if="column.key == 'selection'">
                <el-checkbox v-model:model-value="rowData.Checked" />
                <audio :id="'card-audio-' + rowData.NoteId" preload="auto" :key="'ca' + rowData.NoteId">
                  <source :src="SERVER_BASE_URL + '/audio?fileName=' + rowData.AudioFileName" type="audio/mpeg" />
                </audio>
                <audio :id="'word-voice-' + rowData.NoteId" preload="auto" :key="'wv' + rowData.NoteId">
                  <source :src="SERVER_BASE_URL + '/word-voice?fileName=' + rowData.Lemma + '.mp3'" type="audio/mpeg" />
                </audio>
              </template>
              <template v-if="column.key == 'tags'">
                <el-tag v-for="tag in rowData.Tags">{{ tag }}</el-tag>
              </template>
              <template v-if="column.key === 'status'">
                <el-radio-group :model-value="rowData.Status" class="ml-4"
                  @change="(value) => changeWordStatus(rowData, value, false)" :key="rowData.NoteId">
                  <el-radio-button :value="1" size="large">New</el-radio-button>
                  <el-radio-button :value="2" size="large">Rec</el-radio-button>
                  <el-radio-button :value="3" size="large">Fam</el-radio-button>
                  <el-radio-button :value="4" size="large">Ler</el-radio-button>
                  <el-radio-button :value="5" size="large">Knw</el-radio-button>
                </el-radio-group>

              </template>
              <!-- <template v-else-if="rowData != null">
                {{ rowData[column.key] }}
              </template> -->
            </template>
          </el-table-v2>
        </template>
      </el-auto-resizer>
    </el-col>
    <el-col :span="9" v-if="currRow != null">
      <div class="word-info-box">
        <div>
          <div class="mt-2">
            <label>Lemma</label>
            <el-input v-model="currRow.Lemma"></el-input>
          </div>
          <!-- <div class="mt-2">
            <label>Word</label>
            <el-input v-model="currentRow.Word"></el-input>
          </div> -->
          <div class="mt-2">
            <label>IPA</label>
            <el-input v-model="currRow.IPA"></el-input>
          </div>

          <div class="mt-2">
            <label>Word Definition</label>
            <el-input autosize type="textarea" v-model="currRow.WordDefinition"></el-input>
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
                  <el-button @click="() => playAudio('card-audio-')" type="primary">Replay Audio</el-button>
                </div>
                <div>
                  <el-button @click="() => updateWord(currRow,false)" type="primary">Update</el-button>
                </div>
                <div>
                  <el-button @click="highLightWord" type="warning">Highlight</el-button>
                </div>
                <div>
                  <el-button @click="() => deleteWord(currRow!.NoteId)" type="danger">Remove</el-button>
                </div>
              </div>
            </div>
            <QuillEditor v-model:content="currRow.Context" toolbar="minimal" content-type="html"
              style="margin-bottom: 2px">
            </QuillEditor>
          </div>
          <div class="d-flex justify-content-between">
            <div>
              <el-tag v-for="tag in currRow.Tags">{{ tag }}</el-tag>
            </div>
          </div>
          <div class="mt-2">
            <label>Context Translation</label>
            <QuillEditor v-model:content="currRow.ContextTranslation" toolbar="#context-toolbar2" content-type="html">
              <template #toolbar>
                <div id="context-toolbar2" class="my-toolbar"></div>
              </template>
            </QuillEditor>
          </div>
          <br />
        </div>
        <div class="card-images">
          <img :src="SERVER_BASE_URL + '/image?fileName=' + currRow.ImageFileName" />
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
  ElRow,
  ElCol,
  ElInput,
  ElMessageBox,
  ElButton,
  ElTableV2,
  ElAutoResizer,
  SortBy,
  TableV2SortOrder,
  RowClassNameGetter,
  Column,
  ElRadioGroup,
  ElRadioButton,
  ElCheckbox,
  CheckboxValueType
} from "element-plus";
import SERVER_BASE_URL from "../../libs/url";
import LessonWordModel from "../../models/lesson/LessonWordModel";
import { onMounted, ref, toRef, watch } from "vue";
import ajax from "@/libs/ajax";
import AnkiResponseModel from "@/models/response/AnkiResponseModel";
import moment from "moment";
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";

const props = defineProps<{
  videoId: string;
  autoPlayAudio: boolean;
  voiceType: string;
  autoHideUpdatedNote: boolean;
}>();
let rootData: LessonWordModel[];
const lessonWords = ref<LessonWordModel[]>([]);

const typeText = ref<string | null>("")
const searchText = ref<string>("");

const currRow = ref<LessonWordModel | null>(null);
var prevRow: LessonWordModel | null;
const sortState = ref<SortBy>({
  key: 'Lemma',
  order: TableV2SortOrder.ASC,
})
const allSelected = ref<boolean>(false)
const totalWord = ref<number>(0)
const updatedWord = ref<number>(0)
const newWordAmount = ref<number>(0)
const recognizedWordAmount = ref<number>(0)
const familiarWordAmount = ref<number>(0)
const learnedWordAmount = ref<number>(0)
const knownWordAmount = ref<number>(0)
let updatedStatusWordIds: number[] = []
const isHideUpdatedNoteProp = toRef(props, 'autoHideUpdatedNote');


watch(isHideUpdatedNoteProp, (newvalue, oldVaue) => {
  filterWords()
})


const columns: Column<any>[] = [
  {
    key: "selection",
    width: 30
  },
  {
    key: "Lemma",
    dataKey: "Lemma",
    title: "Word",
    sortable: true,
    width: 130
  },
  {
    key: "IPA",
    dataKey: "IPA",
    title: "IPA",
    width: 120
  },
  {
    key: "tags",
    dataKey: "tags",
    title: "Tags",
    width: 100
  },
  {
    key: "status",
    dataKey: "status",
    title: "Status",
    width: 350,
  },
  {
    key: "WordDefinition",
    dataKey: "WordDefinition",
    title: "Word Definition",
    width: 250
  }
]


onMounted(() => {
  getLessonWord();
});

const getLessonWord = () => {
  ajax
    .get<AnkiResponseModel>(
      `/lesson-words?vid=${props.videoId}`
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
        rootData = [];
        totalWord.value = 0;
        res.data?.result.forEach((item: any) => {
          var word: LessonWordModel = {
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
            Status: +item["fields"]["Status"].value,
            NoteId: item.noteId,
            Tags: item.tags,
            Checked: false,
            Updated: false
          };
          totalWord.value++
          rootData.push(word)
        });
        filterWords()
      }
    })
    .catch((res) => {
      console.log(res);
    });
};


const filterWords = () => {
  if (!searchText.value) {
    lessonWords.value = rootData
  } else if (searchText.value.includes("st:")) {
    var status = parseInt(searchText.value.substring(3))
    lessonWords.value = rootData.filter((w) => w.Status == status)
  } else {
    lessonWords.value = rootData.filter((w) => w.Lemma.includes(searchText.value) || w.WordDefinition.includes(searchText.value))
  }
  if (props.autoHideUpdatedNote) {
    lessonWords.value.forEach(w=>w.Checked = false)
    lessonWords.value = lessonWords.value.filter(w => !w.Updated)
  }
  scanAllWordStatus()
  sortWordByLemmaAsc()
}

const getRowProps = (row: any) => {
  return {
    onClick: (event: any) => handleRowClick(event, row),
  }
}

const handleRowClick = (event: any, row: any) => {
  var target = event.target as HTMLElement
  if (target.className.includes("el-radio")) {
    return
  }
  var rowClicked = row.rowData as LessonWordModel
  if (currRow.value == null) {
    currRow.value = rowClicked
  } else if (currRow.value != rowClicked) {
    prevRow = currRow.value
    currRow.value = rowClicked
    //updateLRWord(prevRow);
  }
  playMedia()
}

const rowClass = ({ rowData }: Parameters<RowClassNameGetter<any>>[0]) => {
  if (rowData.NoteId === currRow.value?.NoteId) {
    return 'highlight-row'
  } else {
    return ''
  }
}

const updateWord = (word: LessonWordModel | null,fromSelection: boolean) => {
  if (word == null) {
    return
  }
  ajax.post<AnkiResponseModel>(
    "/lr-word",
    JSON.stringify({
      NoteId: word.NoteId,
      Lemma: word.Lemma,
      Word: word.Word,
      IPA: word.IPA,
      "Word definition": word.WordDefinition,
      Context: word.Context,
      "Context translation": word.ContextTranslation
    })
  )
    .then((res) => {
      if (props.autoHideUpdatedNote && !fromSelection) {
        //--> auto move current row to next row or next checked row
        var wordIndex = lessonWords.value.indexOf(word)
        // priority for checked row
        var nextRowIndex = lessonWords.value.findIndex((w, idx) => w.Checked)
        if (nextRowIndex == -1) {
          nextRowIndex = lessonWords.value.findIndex((w, idx) => idx == wordIndex + 1)
        }
        if (nextRowIndex != -1) {
          prevRow = currRow.value
          currRow.value = lessonWords.value[nextRowIndex]
          playMedia()
        }
      }else if(props.autoHideUpdatedNote && fromSelection){
        word.Checked = false
      }
      word.Updated = true
      setTimeout(() => {
        recordUpdatedStatusWord(word, wordIndex)
      }, 1000);
    })
    .catch((res) => {
      console.error(res);
    });
};

const changeWordStatus = (word: LessonWordModel, newStatus: any, fromSelection: boolean) => {
  var updateStatusModel = {
    NoteId: word.NoteId,
    Status: newStatus.toString(),
  }
  ajax.post<AnkiResponseModel>(
    "/note-status",
    JSON.stringify(updateStatusModel)
  )
    .then((res) => {
      if (res.status === 200) {
        if (res.data.error) {
          ElMessage({
            type: "error",
            message: res.data.error,
          });
        } else {
          analyzeWordStatus(newStatus, word.Status)
          word.Status = newStatus
          updateWord(word, fromSelection)
        }
      }
    })
    .catch((res) => {
      ElMessage({
        type: "error",
        message: res.response.data,
      });
    });
}

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
  let wordContextList = lessonWords.value.map(({ NoteId: NoteId, Context }) => ({
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

const deleteWord = (noteId: number) => {
  ElMessageBox.confirm("Permanently delete the word. Continue?", "Warning", {
    confirmButtonText: "OK",
    cancelButtonText: "Cancel",
    type: "warning",
  })
    .then(() => {
      ajax
        .get<AnkiResponseModel>(
          `delete-note?noteId=${noteId}&audioFileName=${currRow.value?.AudioFileName}&prevImageFileName=${currRow.value?.ImageFileName}`
        )
        .then((res) => {
          if (res.data.error == null) {
            ElMessage({
              type: "success",
              message: "Delete completed",
            });
            lessonWords.value = lessonWords.value.filter(
              (wordItem) => wordItem.NoteId != currRow.value?.NoteId
            );
          }
        })
        .catch((res) => {
          console.error(res);
        });
    })
    .catch(() => { });
};

const playMedia = () => {
  if (props.autoPlayAudio && props.voiceType == "Context") {
    playAudio("card-audio-");
  }
  if (props.autoPlayAudio && props.voiceType == "Word") {
    playAudio("word-voice-");
  }
};

const playAudio = (type: string) => {
  var prevAudioElement = document.getElementById(
    type + prevRow?.NoteId
  ) as HTMLAudioElement;
  var currAudioElement = document.getElementById(
    type + currRow.value?.NoteId
  ) as HTMLAudioElement;

  if (prevAudioElement != null && prevAudioElement.readyState >= 3) {
    prevAudioElement.pause();
  }
  if (currAudioElement != null && currAudioElement.readyState >= 3) {

    currAudioElement.play();
  }
};

const highLightWord = () => {
  var selectText = window.getSelection()?.toString();
  if (currRow.value != null && selectText != null) {
    var highlightText = `<span style="background-color: rgb(255, 170, 0);">${selectText}</span>`;
    currRow.value.Context = currRow.value.Context.replace(
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
      playMedia();
    }
  }

  if (e.altKey && e.key == "a" && targetElement.className == "ql-editor") {
    highLightWord();
  }
});

const goToNextWord = () => {
  if (currRow.value != null) {
    var currentRowIndex = lessonWords.value.indexOf(currRow.value);
    if (currentRowIndex == lessonWords.value.length - 1) {
      return;
    }
    // singleTableRef.value?.setCurrentRow(
    //   lessonWords.value[currentRowIndex + 1]
    // );
    typeText.value = null
  }
}

const goToPreviousWord = () => {
  if (currRow.value != null) {
    var currentRowIndex = lessonWords.value.indexOf(currRow.value);
    if (currentRowIndex == 0) {
      return;
    }
    // singleTableRef.value?.setCurrentRow(
    //   lessonWords.value[currentRowIndex - 1]
    // );
  }
}

const onSort = (sortBy: SortBy) => {
  if (sortBy.order == 'asc') {
    sortWordByLemmaAsc()
  } else {
    sortWordByLemmaDesc()
  }
  sortState.value = sortBy
}

const sortWordByLemmaAsc = () => {
  lessonWords.value.sort((a, b) => a.Lemma.localeCompare(b.Lemma))
}

const sortWordByLemmaDesc = () => {
  lessonWords.value.sort((a, b) => b.Lemma.localeCompare(a.Lemma))
}

const onAllRowSelectionChange = (value: CheckboxValueType) => {
  lessonWords.value = lessonWords.value.map(word => {
    word.Checked = value as boolean
    return word
  })
}

const scanAllWordStatus = () => {
  newWordAmount.value = 0
  recognizedWordAmount.value = 0
  familiarWordAmount.value = 0
  learnedWordAmount.value = 0
  knownWordAmount.value = 0
  updatedWord.value = updatedStatusWordIds.length
  lessonWords.value.forEach((word) => {
    analyzeWordStatus(word.Status)
  })
}

const analyzeWordStatus = (currentStatus: number, previousStatus: number = 0) => {
  // check increase amount
  if (currentStatus == 1) {
    newWordAmount.value++
  } else if (currentStatus == 2) {
    recognizedWordAmount.value++
  } else if (currentStatus == 3) {
    familiarWordAmount.value++
  } else if (currentStatus == 4) {
    learnedWordAmount.value++
  } else if (currentStatus == 5) {
    knownWordAmount.value++
  }

  // check descrease amount
  if (previousStatus == 0) {
    return
  } else if (previousStatus == 1) {
    newWordAmount.value--
  } else if (previousStatus == 2) {
    recognizedWordAmount.value--
  } else if (previousStatus == 3) {
    familiarWordAmount.value--
  } else if (previousStatus == 4) {
    learnedWordAmount.value--
  } else if (previousStatus == 5) {
    knownWordAmount.value--
  }

}

const levelUpStatus = () => {
  lessonWords.value.forEach((w) => {
    if (w.Checked && w.Status < 5) {
      var newStatus = w.Status + 1;
      changeWordStatus(w, newStatus, true)
    }
  })
}

const levelDownStatus = () => {
  lessonWords.value.forEach((w) => {
    if (w.Checked && w.Status > 1) {
      var newStatus = w.Status - 1
      changeWordStatus(w, newStatus, true)
    }
  })
}

const recordUpdatedStatusWord = (word: LessonWordModel, wordIndex: number) => {
  if (updatedStatusWordIds.includes(word.NoteId)) {
    return
  } else {
    updatedStatusWordIds.push(word.NoteId)
    updatedWord.value++
    if (props.autoHideUpdatedNote) {
      lessonWords.value.splice(wordIndex, 1)
    }
  }
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

.highlight-row {
  background-color: #5cbafe99;
}

.action-control-ctn {
  display: flex;
  justify-content: center;
}

.word-status-ctn {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  /* 3 columns */
  grid-template-rows: repeat(1, 1fr);
  /* 2 rows */
  gap: 10px;
}
</style>
