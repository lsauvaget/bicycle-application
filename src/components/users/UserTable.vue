<template>
  <b-row class="mt-2 px-3">
    <b-table
      stacked="md"
      :items="filteredPeople"
      :fields="filteredFields"
      :filter="userSearch"
      :sort-by.sync="sortBy"
      :sort-desc.sync="sortDesc"
      small
      table-variant="light"
      light
      hover
    >
      <template v-slot:cell(name)="row">
        <span style="text-transform: capitalize" class="mr-2">{{
          row.item.name
        }}</span>
        <b-badge v-if="row.item.penalty" variant="danger"
          >{{ row.item.penalty }}
          {{ row.item.penalty == 1 ? "day" : "days" }} penalty
          remaining</b-badge
        >
        <b-badge class="mr-2" variant="secondary" v-if="row.item.bicycleID"
          >ID: {{ formattedID(row.item.bicycleID) }}</b-badge
        >
        <status-badge :item="row.item" />
      </template>
      <template v-slot:cell(code)="row">
        {{ row.item.code }}
      </template>

      <template v-slot:cell(deposit)="row">
        <b-badge v-if="row.item.deposit" variant="light">Paid</b-badge>
        <b-badge v-else variant="warning">Unpaid</b-badge>
      </template>
      <template v-slot:cell(donation)="row">
        <span class="text-muted">€ </span
        >{{ row.item.amount > 0 ? row.item.amount : 0 }}
      </template>
      <template v-slot:cell(rentals)="row">
        {{ rentalCount(row.item.key) }}
      </template>
      <template v-slot:cell(bicycleKey)="row">
        <b-button-group>
          <b-button
            v-if="!row.item.bicycleKey && !row.item.penalty"
            @click="selectUser(row.item)"
            variant="light"
            size="sm"
            class="pl-2"
          >
            Borrow
          </b-button>
          <b-button
            v-if="row.item.penalty"
            @click="selectUser(row.item)"
            variant="light"
            size="sm"
            disabled
            class="pl-2"
            >Borrow
          </b-button>
          <b-button
            v-if="row.item.bicycleKey"
            @click="returnBicycle(row.item)"
            variant="light"
            size="sm"
          >
            Return
          </b-button>
          <b-dropdown size="sm" id="dropdown-1" variant="light" right>
            <b-dropdown-item @click="editModal(row.item, $event.target)"
              >Edit</b-dropdown-item
            >
            <b-dropdown-item @click="historyModal(row.item, $event.target)"
              >History</b-dropdown-item
            >
            <b-dropdown-item @click="deleteModal(row.item, $event.target)"
              >Delete</b-dropdown-item
            >
          </b-dropdown>
        </b-button-group>
      </template>
    </b-table>
    <edit-user :user="selectedUser" />
    <delete-user :user="selectedUser" />
    <choose-bicycle :user="selectedUser" />
    <return-bicycle :bicycle="selectedBicycle" :user="selectedUser" />
    <history :user="selectedUser" />
  </b-row>
</template>

<script>
import EditUser from "./EditUser";
import DeleteUser from "./DeleteUser";
import ChooseBicycle from "./ChooseBicycle";
import ReturnBicycle from "./ReturnBicycle";
import StatusBadge from "./StatusBadge";
import History from "./History";
import { db } from "@/firebase";
export default {
  data() {
    return {
      selectedUser: {},
      selectedBicycle: {},
      sortBy: "bicycleKey",
      sortDesc: true,
      fields: [
        {
          key: "name",
          label: "Name",
          sortable: true
        },

        {
          key: "phone",
          label: "Phone"
        },
        {
          key: "organisation",
          label: "Org",
          class: "text-capitalize",
          sortable: true
        },
        {
          key: "deposit",
          label: "Deposit",
          sortable: true
        },
        {
          key: "donation",
          label: "Donation",
          sortable: true
        },
        {
          key: "code",
          label: "Ausweis"
        },
        {
          key: "rentals",
          label: "Rentals",
          class: " d-lg-table-cell"
        },
        {
          key: "bicycleKey",
          label: "",
          sortable: true,
          class: " text-md-right"
        }
      ]
    };
  },
  props: {
    userSearch: String,
    filters: Array
  },
  components: {
    EditUser,
    DeleteUser,
    ChooseBicycle,
    ReturnBicycle,
    StatusBadge,
    History
  },
  computed: {
    filteredFields() {
      if (this.filters.includes("visitors")) {
        return this.fields.filter(f => {
          return (
            f.key != "organisation" &&
            f.key != "deposit" &&
            f.key != "phone" &&
            f.key != "donation"
          );
        });
      }
      if (this.filters.includes("helpers")) {
        return this.fields.filter(f => {
          return f.key != "deposit" && f.key != "donation" && f.key != "phone";
        });
      }
      if (this.filters.includes("volunteers")) {
        return this.fields.filter(f => {
          return f.key != "code" && f.key != "rentals";
        });
      } else {
        return this.fields;
      }
    },
    filteredPeople() {
      var filtered;
      filtered = this.$store.state.people;
      if (this.filters.includes("renting")) {
        filtered = this.people.filter(p => {
          return p.bicycleKey;
        });
      }
      if (this.filters.includes("volunteers")) {
        filtered = filtered.filter(p => {
          return p.type == "volunteer";
        });
      }
      if (this.filters.includes("helpers")) {
        filtered = filtered.filter(p => {
          return p.type == "helper";
        });
      }
      if (this.filters.includes("visitors")) {
        filtered = filtered.filter(p => {
          return p.type == "visitor";
        });
      }
      return filtered;
    }
  },
  methods: {
    formattedID(input) {
      var id;
      var digit = parseInt(input);
      if (digit < 10) {
        id = "00" + digit;
      } else if (digit < 99) {
        id = "0" + digit;
      } else {
        id = digit;
      }
      return id;
    },
    deleteModal(user, button) {
      this.$root.$emit("bv::show::modal", "delete-user-modal", button);
      this.selectedUser = user;
    },
    historyModal(user, button) {
      this.$root.$emit("bv::show::modal", "history", button);
      this.selectedUser = user;
    },
    editModal(user, button) {
      this.$root.$emit("bv::show::modal", "edit-user-modal", button);
      this.selectedUser = user;
    },
    selectUser(user) {
      this.$root.$emit("bv::show::modal", "choose-bicycle");
      this.selectedUser = user;
    },
    returnBicycle(user) {
      var key = user.bicycleKey;
      var bicycle;
      db.ref("bicycles/" + key).on("value", function(snapshot) {
        bicycle = snapshot.val();
        bicycle.key = snapshot.key;
      });
      this.$root.$emit("bv::show::modal", "return-bicycle");
      this.selectedBicycle = bicycle;
      this.selectedUser = user;
    },
    calculatePenalty(penalty) {
      return Math.ceil(penalty / 1000 / 60 / 60 / 24 - this.$dateToDays()) > 1
        ? Math.ceil(penalty / 1000 / 60 / 60 / 24 - this.$dateToDays())
        : null;
    },
    rentalCount(userKey) {
      var index = this.$store.state.rentalKeys.indexOf(userKey);
      if (index != -1) {
        return Object.keys(this.$store.state.rentals[userKey]).length;
      }
      return 0;
    }
  },
  mounted: function() {
    if (!this.$store.state.people.length) this.$store.commit("fetchPeople");
    if (!this.$store.state.rentals) this.$store.commit("fetchRentals");
  }
};
</script>

<style>
.badge {
}
.table-hover tbody tr:hover {
  background-color: #f5f5f5 !important;
}
.b-table-stacked-md [data-label]::before {
  text-align: left !important;
  width: 28% !important;
}
@media (max-width: 576px) {
  .table.b-table.b-table-stacked-md div {
    padding-left: 0 !important;
  }
  .table.b-table.b-table-stacked-md > tbody > tr > [data-label] > div {
    width: 72% !important;
  }
}
.menuClass {
  padding: 1rem 1.2rem !important;
}
</style>
