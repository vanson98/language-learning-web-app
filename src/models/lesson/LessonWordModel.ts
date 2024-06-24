export default interface LessonWordModel {
    CardId: string,
    NoteId: string,
    AudioFileName: string,
    Context: string,
    ContextTranslation: string,
    DateCreated: Date,
    IPA: string,
    Lemma: string,
    ImageFileName: string,
    Word: string,
    WordDefinition: string,
    Tags: string[]
}