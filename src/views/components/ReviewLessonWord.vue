<template>
  <el-row style="height: 5%;">
    <el-col :span="4">
      <el-input v-model="functionTextBox" placeholder="st: | bl: " @keyup.enter="filterWords"></el-input>
    </el-col>
    <el-col :span="4">
      <div class="action-control-ctn">
        <el-button @click="getLessonWords" type="primary">Load Data</el-button>
        <el-dropdown>
          <el-button type="primary">
            Action
          </el-button>
          <template #dropdown>
            <ElDropdownMenu>
              <el-dropdown-item @click="selectTopTenWordNote">Select top 10</el-dropdown-item>
              <el-dropdown-item @click="levelUpStatus">Status +1</el-dropdown-item>
              <el-dropdown-item @click="levelDownStatus">Status -1</el-dropdown-item>
              <el-dropdown-item @click="updateRangeWord">Update</el-dropdown-item>
              <el-dropdown-item @click="highLightAllWord">Highlight All</el-dropdown-item>
              <el-dropdown-item @click="fillIPAForWord">Fill IPA</el-dropdown-item>
            </ElDropdownMenu>
          </template>
        </el-dropdown>

        <!-- <el-button  type="warning"></el-button>
        <el-button type="success">Status +1</el-button>
        <el-button @ type="warning">Status -1</el-button> -->
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
  <el-row style="height: 95%; border: 1px solid; border-color: #8080806f;">
    <el-col :span="15" style="height: 100%;padding-right: 8px;">
      <el-auto-resizer>
        <template #default="{ height, width }">
          <el-table-v2 
              :columns="columns" 
              :data="wordNotes" 
              :width="width" 
              :height="height" 
              :sort-by="sortState"
              @column-sort="onSort" 
              :row-props="getRowProps" 
              :row-class="rowClass" 
              fixed>
            <!-- Use the scoped slot to render the custom cell -->
            <template #header-cell="{ column }">
              <template v-if="column.key == 'selection'">
                <ElCheckbox :v-model:model-value="allSelected" @change="(value) => onAllRowSelectionChange(value)" />
              </template>
            </template>

            <template #cell="{ rowData, column, rowIndex }">
              <template v-if="column.key == 'selection'">
                <el-checkbox v-model:model-value="rowData.Checked" />
              </template>
              <template v-if="column.key == 'Lemma'">
                <ElTooltip class="box-item" :content="rowData.WordDefinition" placement="top-start" :hide-after="0">
                  <span>
                    {{ rowData.Lemma }}
                  </span>
                </ElTooltip>
              </template>
              <template v-if="column.key == 'tags'">
                <el-tag v-for="tag in rowData.Tags">{{ tag }}</el-tag>
              </template>
              <template v-if="column.key === 'status'">
                <el-radio-group :model-value="rowData.Status" class="ml-4"
                  @change="(value) => updateWordNote(rowData, false, value as number)" :key="rowData.NoteId">
                  <el-radio-button :value="1" size="large">New</el-radio-button>
                  <el-radio-button :value="2" size="large">Rec</el-radio-button>
                  <el-radio-button :value="3" size="large">Fam</el-radio-button>
                  <el-radio-button :value="4" size="large">Ler</el-radio-button>
                  <el-radio-button :value="5" size="large">Knw</el-radio-button>
                </el-radio-group>
              </template>
            </template>

            <template #overlay v-if="loading">
              <div class="el-loading-mask" style="display: flex; align-items: center; justify-content: center">
                <ElIcon class="is-loading" color="var(--el-color-primary)" :size="26">
                  <Loading />
                </ElIcon>
              </div>
            </template>
          </el-table-v2>
        </template>
      </el-auto-resizer>
    </el-col>
    <el-col :span="9" v-if="currSelectedRow != null" style="height: 100%;">
      <div class="word-info-box">
        <div>
          <div class="card-images">
            <img :src="SERVER_BASE_URL + '/image?fileName=' + currSelectedRow.ImageFileName" />
            <strong>{{ currSelectedRow.VideoTitle }}</strong>
          </div>
          <div class="mt-2">
            <label>Lemma</label>
            <el-input v-model="currSelectedRow.Lemma"></el-input>
          </div>
          <div class="mt-2 d-flex justify-content-between">
            <div class="w-100 pe-2">
              <label>IPA</label>
              <el-input v-model="currSelectedRow.IPA"></el-input>
            </div>
            <div class="w-100">
              <label>Type</label>
              <el-input @keydown.enter="goToNextRow" v-model="typeText"></el-input>
            </div>
          </div>

          <div class="mt-2">
            <label>Word Definition</label>
            <el-input autosize type="textarea" v-model="currSelectedRow.WordDefinition"></el-input>
          </div>


          <div class="mt-2">

            <div class=" mb-2 d-flex justify-content-between flex-grow-1">
              <div>
                <el-button @click="() => playAudio('context-voice')" type="primary">Replay Audio</el-button>
              </div>
              <div>
                <el-button @click="() => updateWordNote(currSelectedRow, false, currSelectedRow!.Status)"
                  type="default">Update</el-button>
              </div>
              <div>
                <el-button @click="() => updateWordNote(currSelectedRow, false, currSelectedRow!.Status + 1)"
                  type="success">Update +</el-button>
              </div>
              <div>
                <el-button @click="highLightWord" type="warning">Highlight</el-button>
              </div>
              <div>
                <el-button @click="() => deleteWord(currSelectedRow!.NoteId)" type="danger">Remove</el-button>
              </div>
            </div>
            <QuillEditor v-model:content="currSelectedRow.Context" toolbar="minimal" content-type="html"
              style="margin-bottom: 2px">
            </QuillEditor>
          </div>
          <div class="d-flex justify-content-between">
            <div>
              <el-tag v-for="tag in currSelectedRow.Tags">{{ tag }}</el-tag>
            </div>
          </div>
          <div class="mt-2">
            <label>Context Translation</label>
            <QuillEditor v-model:content="currSelectedRow.ContextTranslation" toolbar="#context-toolbar2"
              content-type="html">
              <template #toolbar>
                <div id="context-toolbar2" class="my-toolbar"></div>
              </template>
            </QuillEditor>
          </div>
          <br />
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
  CheckboxValueType,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
  ElIcon,
  ElTooltip
} from "element-plus";
import { Loading } from '@element-plus/icons-vue'
import { SERVER_BASE_URL } from "../../libs/url";
import WordNoteModel from "../../models/lesson/WordNoteModel";
import { onMounted, ref, toRef, watch } from "vue";
import { ajax, crawAjax } from "../../libs/ajax";
import AnkiResponseModel from "../../models/response/AnkiResponseModel";
import moment from "moment";
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";

const props = defineProps<{
  videoId: string;
  autoPlayAudio: boolean;
  voiceType: string;
  autoHideUpdatedNote: boolean;
}>();

const autoHideUpdatedNoteProp = toRef(props, 'autoHideUpdatedNote');

watch(autoHideUpdatedNoteProp, (newvalue, oldVaue) => {
  functionTextBox.value = ""
  filterWords()
})
// =================== Data Variables ===============
let rootData: WordNoteModel[];
let updatedNodeIds: number[] = []

const wordNotes = ref<WordNoteModel[]>([]);

const totalWord = ref<number>(0)
const updatedWord = ref<number>(0)
const newWordAmount = ref<number>(0)
const recognizedWordAmount = ref<number>(0)
const familiarWordAmount = ref<number>(0)
const learnedWordAmount = ref<number>(0)
const knownWordAmount = ref<number>(0)


// =================== Table Variables ====================
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

const sortState = ref<SortBy>({
  key: 'Lemma',
  order: TableV2SortOrder.ASC,
})

const typeText = ref<string | null>("")
const functionTextBox = ref<string>("");

const allSelected = ref<boolean>(false)
const loading = ref<boolean>(false)


const currSelectedRow = ref<WordNoteModel | null>(null);
let currAudio: HTMLAudioElement

// ====================================== DATA HANDLE ==========================================
onMounted(() => {
  getLessonWords();
  getUpdatedNoteIds()
});

const getLessonWords = () => {
  loading.value = true
  functionTextBox.value = ""
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
          var word = item["fields"]["Word"].value;
          var wordReplacementRegex = new RegExp(`${word},`,"gi")
          var wordNote: WordNoteModel = {
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
            Word: word,
            WordDefinition: (item["fields"]["Word definition"].value as string).replace(wordReplacementRegex,""),
            VideoTitle: item["fields"]["Video title"].value,
            Status: +item["fields"]["Status"].value,
            NoteId: item.noteId,
            Tags: item.tags,
            Checked: false
          };
          totalWord.value++
          rootData.push(wordNote)
        });
        filterWords()
      }
      loading.value = false
    })
    .catch((res) => {
      console.log(res);
      loading.value = false
    });
};

const getUpdatedNoteIds = () => {
  const today = new Date();
  const year = String(today.getFullYear()).substring(2);
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  ajax.get<string[]>(`/updated-noteids?userid=${15091998}&date=${day + month + year}`).then((res) => {
    updatedNodeIds = res.data.map(Number)
  }).catch((res) => {
    console.log(res)
  })
}

const updateWordNote = (wordNote: WordNoteModel | null, formUpdateRange: boolean, newStatus: number) => {
  if (wordNote == null) {
    return
  }
  ajax.post<AnkiResponseModel>(
    "/lr-word",
    JSON.stringify({
      NoteId: wordNote.NoteId,
      Lemma: wordNote.Lemma,
      Word: wordNote.Word,
      IPA: wordNote.IPA,
      "Word definition": wordNote.WordDefinition,
      Context: wordNote.Context,
      "Context translation": wordNote.ContextTranslation,
      Status: newStatus.toString()
    })
  )
    .then((res) => {
      if (res.data.error) {
        ElMessage({
          type: "error",
          message: res.data.error,
        });
        return
      }
      ElMessage({
        type: "success",
        message: `update word: ${wordNote.Lemma} success`,
      });
      if (newStatus != wordNote.Status) {
        analyzeWordStatus(newStatus, wordNote.Status)
        wordNote.Status = newStatus
      }
      if (props.autoHideUpdatedNote) {
        wordNote.Checked = false;
        if (!formUpdateRange) {
          //--> auto move current row to next row or next checked row
          var wordIndex = wordNotes.value.indexOf(wordNote)

          // priority for checked row
          var nextRowIndex = wordNotes.value.findIndex((w, idx) => w.Checked)
          if (nextRowIndex == -1) {
            nextRowIndex = wordNotes.value.findIndex((w, idx) => idx == wordIndex + 1)
          }
          if (nextRowIndex != -1) {
            currSelectedRow.value = wordNotes.value[nextRowIndex]
            playMedia()
          }
        }

      }
      setTimeout(() => {
        recordUpdatedWord(wordNote)
      }, 1000);

    })
    .catch((res) => {
      ElMessage({
          type: "error",
          message: res.data.error,
        });
    });
};

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
  wordNotes.value.forEach((w) => {
    if (w.Checked && w.Status < 5) {
      var newStatus = w.Status + 1;
      updateWordNote(w, true, newStatus)
    }
  })
}

const levelDownStatus = () => {
  wordNotes.value.forEach((w) => {
    if (w.Checked && w.Status > 1) {
      var newStatus = w.Status - 1
      updateWordNote(w, true, newStatus)
    }
  })
}

const updateRangeWord = () => {
  wordNotes.value.forEach((w) => {
    if (w.Checked) {
      updateWordNote(w, true, w.Status)
    }
  })
}

const setStatusForWords = (newStatus: number) => {
  wordNotes.value.forEach((w) => {
    if (w.Checked && w.Status != newStatus) {
      updateWordNoteStatus(w, newStatus)
    }
  })
}

const updateWordNoteStatus = (wordNote:  WordNoteModel , newStatus: number) => {
  ajax.put<AnkiResponseModel>(
    "/note-status",
    JSON.stringify({
      NoteId: wordNote.NoteId,
      Status: newStatus.toString()
    })
  ).then((res) => {
      if (res.data.error) {
        ElMessage({
          type: "error",
          message: res.data.error,
        });
        return
      }
      ElMessage({
        type: "success",
        message: `update status word successfully: ${wordNote.Lemma} `,
      });
      if (newStatus != wordNote.Status) {
        analyzeWordStatus(newStatus, wordNote.Status)
        wordNote.Status = newStatus
      }
    })
    .catch((res) => {
      ElMessage({
          type: "error",
          message: res.message,
        });
    });
};

const recordUpdatedWord = (word: WordNoteModel) => {
  if (updatedNodeIds.includes(word.NoteId)) {
    return
  } else {
    updatedNodeIds.push(word.NoteId)
    updatedWord.value++
    if (props.autoHideUpdatedNote) {
      wordNotes.value = wordNotes.value.filter(w => !updatedNodeIds.includes(w.NoteId))
    }
  }
}

const fillIPAForWord = () => {
  var listSelectedWord = wordNotes.value.filter(w => w.Checked && !w.IPA).map(w => ({ NoteId: w.NoteId, Word: w.Lemma }))
  var requestData = {
    RangeWord: listSelectedWord
  }
  var jsonRequestData = JSON.stringify(requestData)
  crawAjax.post("/get-words-phonetic", jsonRequestData).then((res) => {
    if (res.data instanceof Array) {
      res.data.forEach(p => {
        const node = wordNotes.value.find(n => n.NoteId == p.noteId)
        if (node) {
          node.IPA = p.phonetic
        }
      })
      ElMessage({
        message: `get phonetic success`,
        type: "success",
      });
    }
  }).catch(err => {
    ElMessage({
      message: `get phonetic error`,
      type: "error",
    });
  })
}

const highLightWord = () => {
  var selectText = window.getSelection()?.toString();
  if (currSelectedRow.value != null && selectText != null) {
    var highlightText = `<span style="background-color: rgb(255, 170, 0);">${selectText}</span>`;
    currSelectedRow.value.Context = currSelectedRow.value.Context.replace(
      selectText,
      highlightText
    );
  }
};

const highLightAllWord = () => {
  wordNotes.value.forEach((item) => {
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
  let wordContextList = wordNotes.value.map(({ NoteId: NoteId, Context }) => ({
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
          `delete-note?noteId=${noteId}&audioFileName=${currSelectedRow.value?.AudioFileName}&prevImageFileName=${currSelectedRow.value?.ImageFileName}`
        )
        .then((res) => {
          if (res.data.error == null) {
            ElMessage({
              type: "success",
              message: "Delete completed",
            });
            wordNotes.value = wordNotes.value.filter(
              (wordItem) => wordItem.NoteId != currSelectedRow.value?.NoteId
            );
          }
        })
        .catch((res) => {
          console.error(res);
        });
    })
    .catch(() => { });
};

// ====================================== TABLE HANDLE =========================================

// filter words
const filterWords = () => {
  if (!functionTextBox.value) {
    wordNotes.value = rootData
  } else if (functionTextBox.value.includes("st:")) {
    var status = parseInt(functionTextBox.value.substring(3))
    wordNotes.value = rootData.filter((w) => w.Status == status)
  } else if(functionTextBox.value.includes("bl:")){
    var newStatus = parseInt(functionTextBox.value.substring(3))
    setStatusForWords(newStatus)
  } 
  else {
    wordNotes.value = rootData.filter((w) => w.Lemma.includes(functionTextBox.value) || w.WordDefinition.includes(functionTextBox.value))
  }
  if (props.autoHideUpdatedNote) {
    wordNotes.value = wordNotes.value.filter(w => !updatedNodeIds.includes(w.NoteId))
  }
  scanAllWordStatus()
  sortWordByLemmaAsc()
}

// get row properties
const getRowProps = (row: any) => {
  return {
    onClick: (event: any) => handleRowClick(event, row),
  }
}

// handle when row click
const handleRowClick = (event: any, row: any) => {
  var target = event.target as HTMLElement
  if (target.className.includes("el-radio") || target.className.includes("el-checkbox")) {
    return
  }
  var rowClicked = row.rowData as WordNoteModel
  if (currSelectedRow.value == null) {
    currSelectedRow.value = rowClicked
  } else if (currSelectedRow.value != rowClicked) {
    currSelectedRow.value = rowClicked
  }
  playMedia()
}

const rowClass = ({ rowData }: Parameters<RowClassNameGetter<any>>[0]) => {
  if (rowData.NoteId === currSelectedRow.value?.NoteId) {
    return 'highlight-row'
  } else {
    return ''
  }
}

window.addEventListener("keydown", (e) => {
  var targetElement = e.target as Element;
  if (
    !(targetElement instanceof HTMLInputElement) &&
    !targetElement.className.includes("ql-editor") &&
    !targetElement.className.includes("el-input__inner") &&
    !targetElement.className.includes("el-textarea__inner")
  ) {
    if (e.key == "ArrowDown") {
      goToNextRow()
    }
    if (e.key == "ArrowUp") {
      goToPreviousRow()
    }
    if (e.key == "ArrowRight" && currSelectedRow.value != null && currSelectedRow.value.Status < 5) {
      updateWordNote(currSelectedRow.value, false, currSelectedRow.value.Status + 1)
    }
    if (e.key == "ArrowLeft" && currSelectedRow.value != null && currSelectedRow.value.Status > 1) {
      updateWordNote(currSelectedRow.value, false, currSelectedRow.value.Status - 1)
    }
    if (e.key == "r") {
      playMedia();
    }
  }

  if (e.altKey && e.key == "a" && targetElement.className == "ql-editor") {
    highLightWord();
  }
});

const playMedia = () => {
  if (props.autoPlayAudio && props.voiceType == "Context") {
    playAudio("word-voice");
    setTimeout(() => {
      playAudio("context-voice");
    }, 1500)
  }
  if (props.autoPlayAudio && props.voiceType == "Word") {
    playAudio("word-voice");
  }
};

const playAudio = (type: string) => {
  var fileName = type === 'context-voice' ? currSelectedRow.value?.AudioFileName : currSelectedRow.value?.Lemma + ".mp3"
  ajax.get(`/${type}?fileName=${fileName}`, {
    responseType: 'arraybuffer'
  }).then((res) => {
    const arrayBuffer = res.data;
    // Convert the ArrayBuffer to a Blob
    const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
    // Create an object URL from the Blob
    const url = URL.createObjectURL(blob);
    // Create an audio element and play the MP3
    if (currAudio != null) {
      currAudio.pause()
    }
    currAudio = new Audio(url);
    currAudio.play();
  }).catch(() => {

  })
};

const goToNextRow = () => {
  if (currSelectedRow.value != null) {
    var currentRowIndex = wordNotes.value.indexOf(currSelectedRow.value);

    if (currentRowIndex == wordNotes.value.length - 1) {
      return;
    }
    var nextRow = wordNotes.value.at(currentRowIndex + 1)
    if(nextRow){
      currSelectedRow.value = nextRow
      playMedia()
      typeText.value = null
    }
  }
}

const goToPreviousRow = () => {
  if (currSelectedRow.value != null) {
    var currentRowIndex = wordNotes.value.indexOf(currSelectedRow.value);

    if (currentRowIndex == 0) {
      return;
    }
    var nextRow = wordNotes.value.at(currentRowIndex - 1)
    if(nextRow){
      currSelectedRow.value = nextRow
      playMedia()
      typeText.value = null
    }
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
  wordNotes.value.sort((a, b) => a.Lemma.localeCompare(b.Lemma))
}

const sortWordByLemmaDesc = () => {
  wordNotes.value.sort((a, b) => b.Lemma.localeCompare(a.Lemma))
}

const onAllRowSelectionChange = (value: CheckboxValueType) => {
  wordNotes.value = wordNotes.value.map(word => {
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
  updatedWord.value = updatedNodeIds.length
  wordNotes.value.forEach((word) => {
    analyzeWordStatus(word.Status)
  })
}

const selectTopTenWordNote = () => {
  wordNotes.value.forEach((w, i) => {
    if (i < 10) {
      w.Checked = true
    }
  })
}

</script>

<style>
.word-info-box {
  width: 100%;
  height: 100%;
  padding: 0 8px;
  overflow: scroll;
  border-left: 1px solid;
  border-color: #8080806f;
}

.highlight-row {
  background-color: #5cbafe99;
}

.action-control-ctn {
  display: flex;
  justify-content: space-evenly;
}

.word-status-ctn {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  /* 3 columns */
  grid-template-rows: repeat(1, 1fr);
  /* 2 rows */
  gap: 10px;
}

.tooltip-base-box {
  width: 600px;
}

.tooltip-base-box .row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tooltip-base-box .center {
  justify-content: center;
}

.tooltip-base-box .box-item {
  width: 110px;
  margin-top: 10px;
}
</style>
