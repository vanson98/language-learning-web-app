import NoteInfo from "../note/NoteInfo"

export default interface LRPhraseNoteModel {
    CardId: string,
    NoteId: number,
    AudioFileName: string,
    Context: string,
    ContextTranslation: string,
    DateCreated: Date,
    PhraseIds: string[],
    ImageFileName: string,
    Tags: string[]
    ParentPhrases: {
        NoteId: string,
        Front: string,
        Meaning: string,
        Example: string
    }[] ,
    IsLoadParentPhrase: boolean,
    Checked: boolean
}