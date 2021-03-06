import Vue from "vue";
import VueRouter from "vue-router";
import Visitors from "../components/Visitors.vue";
import Bicycles from "../components/Bicycles.vue";
import Login from "../components/Login.vue";
import Volunteers from "../components/Volunteers.vue";
import Helpers from "../components/Helpers.vue";
import Home from "../components/Home.vue";
import { auth } from "@/firebase";

Vue.use(VueRouter);

const routes = [
  {
    path: "*",
    redirect: "/login"
  },
  {
    path: "/login",
    name: "login",
    component: Login
  },
  {
    path: "/",
    name: "home",
    component: Home,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/visitors",
    name: "visitors",
    component: Visitors,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/volunteers",
    name: "volunteers",
    component: Volunteers,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/helpers",
    name: "helpers",
    component: Helpers,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/bicycles",
    name: "bicycles",
    component: Bicycles,
    meta: {
      requiresAuth: true
    }
  }
];

const router = new VueRouter({
  base: process.env.BASE_URL,
  routes
});

router.beforeEach((to, from, next) => {
  const currentUser = auth.currentUser;
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  if (requiresAuth && !currentUser) next("login");
  else if (!requiresAuth && currentUser) next("home");
  else next();
});

export default router;
