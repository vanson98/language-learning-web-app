import PhraseMasterModel from "./PhraseMasterModel";
import PhraseNoteModel from "./PhraseNoteModel";

export default interface PhrasePairModel {
    PhraseMaster : PhraseMasterModel
    PhraseNotes: PhraseNoteModel[] 
}