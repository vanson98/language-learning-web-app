import { identityAjax } from "@/libs/ajax";
import { defineStore } from "pinia";
import type User from "@/models/authen/User";
import { AxiosResponse } from "axios";


export const useUserInfoStore = defineStore("user", {
  state: () => {
    return {
        user: null as User | null,
    };
  },
  actions: {
    fetchUserInfo() {
      try {
        identityAjax.get("/user-info", {
            withCredentials: true
        }).then((res) => {
            this.user = {
                Username: res.data.username,
                Email: res.data.email
            }
        }).catch((err) => {
            console.log(err);
            this.user = null;
        });
      } catch (error) {
        console.error("Auth check failed:", error);``
        this.user = null;
      }
    },
    logout() {
      this.user = null;
    },
  },
});