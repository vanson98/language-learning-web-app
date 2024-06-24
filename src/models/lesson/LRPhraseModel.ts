import NoteInfo from "../note/NoteInfo"

export default interface LRPhraseModel {
    CardId: string,
    NoteId: string,
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
    IsLoadParentPhrase: boolean
}