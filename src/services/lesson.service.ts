import {ajax} from "@/libs/ajax";
import AppConsts from "@/libs/appconst";

const lessonService = {
  async createNewLesson(data: string) {
    const res = await ajax.post("/add-lesson", data);
  },
};

export default lessonService;
