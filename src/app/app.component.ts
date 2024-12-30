import { CommonModule } from '@angular/common';
import { Component, computed, linkedSignal, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { SelectButtonModule } from 'primeng/selectbutton';

@Component({
  selector: 'app-root',
  imports: [FormsModule, CommonModule, InputTextModule, CheckboxModule, SelectButtonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  standalone: true,
})
export class AppComponent {
  groceryList: any = signal(this.getListFromStorage());
  stateOptions: any[] = [
    { label: 'All', value: 'all' },
    { label: 'Checked', value: 'selected' },
    { label: 'Not checked', value: 'not_selected' },
  ];
  value = model<string>('all');

  filteredList = linkedSignal({
    source: this.groceryList,
    computation: () => this.groceryList().slice(),
  });

  onSelectButtonChange(_: any) {
    this.filteredList.set(
      this.groceryList().map((c: any) => {
        return {
          ...c,
          itemsToBy: c.itemsToBy.filter((i: any) =>
            this.value() === 'all' ? true : i.selected === (this.value() === 'selected')
          ),
        };
      })
    );
  }

  addCategory() {
    if (this.groceryList().length > 0) {
      this.groceryList.update(() => [
        {
          id: (Math.random() + 1) * 10,
          title: '',
          itemsToBy: [{ id: (Math.random() + 1) * 10, name: '', selected: false }],
        },
        ...this.groceryList(),
      ]);
    } else {
      this.groceryList.set([
        {
          id: (Math.random() + 1) * 10,
          title: '',
          itemsToBy: [{ id: (Math.random() + 1) * 10, name: '', selected: false }],
        },
      ]);
    }

    this.value.set('all');

    this.saveListToStorage();
  }

  removeCategory(index: number) {
    if (!this.groceryList()[index]) return;

    this.groceryList.update((list: any) => list.filter((_: any, i: number) => i !== index));

    this.saveListToStorage();
  }

  addItemToCategory(index: number) {
    if (!this.groceryList()[index]) return;

    this.groceryList()[index].itemsToBy.unshift({ id: (Math.random() + 1) * 10, name: '', selected: false });

    this.saveListToStorage();
  }

  removeItemFromCategory(categoryIndex: number, itemIndex: number) {
    if (!this.groceryList()[categoryIndex]) return;

    this.groceryList()[categoryIndex].itemsToBy.splice(itemIndex, 1);

    this.saveListToStorage();
  }

  saveListToStorage() {
    localStorage.setItem('groceryList', JSON.stringify(this.groceryList()));
  }

  getListFromStorage() {
    if (localStorage.getItem('groceryList')) {
      return JSON.parse(localStorage.getItem('groceryList')!);
    }

    return [];
  }

  handleFileInput(file: any, fileUpload: any) {
    const reader = new FileReader();
    reader.readAsText(file.target.files[0]);
    reader.onload = () => {
      const fileContent = reader.result;

      if (!fileContent || typeof fileContent !== 'string') return;

      this.groceryList.set(
        fileContent
          .split('#')
          .filter((f) => f.replace(/\s/g, '') !== '')
          .map((l, index) => {
            const groceryItem: any = { itemsToBy: [] };
            l.split('\n').forEach((item, i) => {
              if (i === 0 && item) {
                groceryItem.id = index;
                groceryItem.title = item.replace(/\s/g, ' ');
              } else {
                if (item)
                  groceryItem.itemsToBy.push({ id: index + i, name: item.replace(/\s/g, ' '), selected: false });
              }
            });
            return groceryItem;
          })
      );

      (fileUpload as HTMLInputElement).value = '';

      this.saveListToStorage();
    };
  }
}
