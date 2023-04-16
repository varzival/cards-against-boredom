<template>
  <v-dialog
    :modelValue="modelValue"
    @update:modelValue="
      (newValue) => {
        if (!newValue) {
          ask4Real = false;
          emit('update:modelValue', null);
        }
      }
    "
    width="500"
  >
    <v-card shaped>
      <v-card-title>
        <v-row>
          <v-col style="margin: auto">
            <slot name="title"></slot>
          </v-col>
          <v-col cols="2">
            <v-btn
              icon
              dark
              plain
              elevation="0"
              @click="
                () => {
                  ask4Real = false;
                  emit('update:modelValue', null);
                }
              "
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </v-card-title>

      <v-card-text> <slot name="text"></slot> </v-card-text>

      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          v-if="ask4Real"
          color="red"
          :disabled="!id"
          @click="
            () => {
              ask4Real = false;
              emit('delete');
            }
          "
        >
          4 real?
        </v-btn>
        <v-btn
          v-else
          color="red"
          :disabled="!id"
          icon
          fab
          @click="ask4Real = true"
        >
          <v-icon>mdi-delete</v-icon>
        </v-btn>
        <v-btn
          color="red"
          icon
          fab
          @click="
            () => {
              ask4Real = false;
              emit('save');
            }
          "
        >
          <v-icon>mdi-check</v-icon>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { ref } from "vue";

const { modelValue, id } = defineProps<{
  modelValue: boolean;
  id: string | null;
}>();

const ask4Real = ref(false);

const emit = defineEmits<{
  (e: "update:modelValue", value: any): void;
  (e: "delete"): void;
  (e: "save"): void;
}>();
</script>
