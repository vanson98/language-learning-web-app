import NoteInfo from "../note/NoteInfo"

export default interface PhraseNoteModel {
    CardId: string,
    NoteId: number,
    AudioFileName: string,
    Context: string,
    ContextTranslation: string,
    MasterPhraseIds: number[],
    ImageFileName: string,
    Tags: string[]
    MasterPhrases: {
        NoteId: number,
        Front: string,
        Meaning: string,
        Example: string
    }[] ,
    IsLoadParentPhrase: boolean,
    Checked: boolean
}