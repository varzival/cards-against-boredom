import { ref } from "vue";
import type { Ref } from "vue";

export type CRUDBaseType = {
  _id: string;
};

const PER_PAGE = 10;

class CRUDObject<Type extends CRUDBaseType> {
  public all: Ref<Array<Type>>;
  public page: Ref<number>;
  public selected: Ref<Type | null>;
  public allLoaded: Ref<boolean>;

  constructor(public name: string, private defaultValue: Type) {
    this.all = ref<Array<Type>>([]) as Ref<Array<Type>>;
    this.page = ref<number>(0);
    this.selected = ref<Type | null>(null) as Ref<Type | null>;
    this.allLoaded = ref<boolean>(false);
  }

  public async load() {
    if (this.allLoaded.value) return;
    const response = await fetch(
      `/api/${this.name}?perPage=${PER_PAGE}&page=${this.page.value}`
    );
    const newCards = await response.json();
    this.all.value = this.all.value.concat(newCards);
    this.page.value += 1;
    if (!newCards.length) this.allLoaded.value = true;
  }

  public selectNew() {
    this.selected.value = {
      ...this.defaultValue
    };
  }

  public select(id: string) {
    const obj = this.all.value.find((c) => c._id === id);
    if (obj)
      this.selected.value = {
        ...obj
      };
  }

  public async create() {
    if (!this.selected.value) return;

    const { _id, ...set } = this.selected.value;
    const response = await fetch(`/api/${this.name}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(set)
    });

    const obj = await response.json();
    this.all.value.unshift({
      ...obj
    });
    this.selected.value = null;
  }

  public async delete() {
    if (!this.selected.value?._id) return;

    const id = this.selected.value._id;
    const response = await fetch(`/api/${this.name}/${id}`, {
      method: "DELETE"
    });

    const respJson = await response.json();
    if (respJson.deletedCount >= 1) {
      const idx = this.all.value.findIndex((c) => c._id === id);
      if (idx > -1) {
        this.all.value.splice(idx, 1);
      }
    }
    this.selected.value = null;
  }

  public async update() {
    if (!this.selected.value?._id) return;

    const { _id, ...set } = this.selected.value;
    const response = await fetch(`/api/${this.name}/${_id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(set)
    });
    const obj = await response.json();
    const idx = this.all.value.findIndex((c) => c._id === obj._id);
    if (idx > -1) {
      this.all.value.splice(idx, 1, obj);
    }
    this.selected.value = null;
  }
}

export default CRUDObject;
