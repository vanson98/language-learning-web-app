export default interface PhraseMasterModel {
    NoteId: number,
    Front: string,
    Meaning: string,
    VietnameseMeaning: string | null,
    Status: number,
    Example: string,
    Tags: string[] | null,
    Checked: boolean,
}