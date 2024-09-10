import PhraseMasterModel from "./PhraseMasterModel"

export default interface PhraseNoteModel {
    NoteId: number,
    VideoTitle: string,
    AudioFileName: string,
    Context: string,
    ContextTranslation: string,
    PhraseMasterIds: string,
    ImageFileName: string
}