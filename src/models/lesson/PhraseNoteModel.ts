import PhraseMasterModel from "./PhraseMasterModel"

export default interface PhraseNoteModel {
    CardId: string,
    NoteId: number,
    VideoTitle: string,
    AudioFileName: string,
    Context: string,
    ContextTranslation: string,
    PhraseMasterIds: number[],
    ImageFileName: string,
    Tags: string[]
    PhraseMasters: PhraseMasterModel[] ,
    IsLoadParentPhrase: boolean,
    Checked: boolean
}