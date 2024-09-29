import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  groceryList: any = signal(this.getListFromStorage());

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
          .split('category')
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
