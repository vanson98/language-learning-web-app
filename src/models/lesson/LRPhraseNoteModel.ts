import NoteInfo from "../note/NoteInfo"

export default interface PhraseNoteModel {
    CardId: string,
    NoteId: number,
    AudioFileName: string,
    Context: string,
    ContextTranslation: string,
    PhraseIds: number[],
    ImageFileName: string,
    Tags: string[]
    ParentPhrases: {
        NoteId: number,
        Front: string,
        Meaning: string,
        Example: string
    }[] ,
    IsLoadParentPhrase: boolean,
    Checked: boolean
}