class Queue<T> {
  private elements: { [index: number]: T } = {};
  private head: number = 0;
  private tail: number = 0;

  enqueue(element: T): void {
    this.elements[this.tail] = element;
    this.tail++;
  }

  dequeue(): T | undefined {
    if (this.isEmpty) {
      return undefined;
    }
    const item = this.elements[this.head];
    delete this.elements[this.head];
    this.head++;
    return item;
  }

  peek(): T | undefined {
    return this.elements[this.head];
  }

  get length(): number {
    return this.tail - this.head;
  }

  get isEmpty(): boolean {
    return this.length === 0;
  }
}
