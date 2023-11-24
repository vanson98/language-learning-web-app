export default interface LessonPhraseModel {
    NoteId: string,
    AudioFileName: string,
    Context: string,
    ContextTranslation: string,
    DateCreated: Date,
    PhraseId: string,
    NextImageFileName: string,
    PrevImageFileName: string,
    Tags: string[]
}