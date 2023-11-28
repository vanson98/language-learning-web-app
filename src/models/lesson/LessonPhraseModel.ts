import NoteInfo from "../note/NoteInfo"

export default interface LessonPhraseModel {
    NoteId: string,
    AudioFileName: string,
    Context: string,
    ContextTranslation: string,
    DateCreated: Date,
    PhraseIds: string[],
    NextImageFileName: string,
    PrevImageFileName: string,
    Tags: string[]
    ParentPhrases: {
        NoteId: string,
        Front: string,
        Meaning: string
    }[] ,
    IsLoadParentPhrase: boolean
}