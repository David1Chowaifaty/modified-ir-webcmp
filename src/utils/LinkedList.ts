/**
 * Represents a single node in a linked list.
 * @template T The type of the value stored in the node.
 */
class ListNode<T> {
  /** The value contained in this node. */
  public value: T;
  /** Reference to the next node in the list (or null if this is the last node). */
  public next: ListNode<T> | null;

  /**
   * Creates a new ListNode.
   * @param value The value to store in the node.
   */
  constructor(value: T) {
    this.value = value;
    this.next = null;
  }
}

/**
 * A generic singly linked list implementation.
 * @template T The type of the values stored in the list.
 */
export class LinkedList<T> {
  /** The head (first node) of the linked list. */
  private head: ListNode<T> | null = null;

  /**
   * Appends a new value at the end of the list.
   * @param value The value to append.
   */
  public append(value: T): void {
    const newNode = new ListNode(value);
    if (!this.head) {
      this.head = newNode;
      return;
    }

    let current = this.head;
    while (current.next) {
      current = current.next;
    }
    current.next = newNode;
  }

  /**
   * Prepends a new value at the start of the list.
   * @param value The value to prepend.
   */
  public prepend(value: T): void {
    const newNode = new ListNode(value);
    newNode.next = this.head;
    this.head = newNode;
  }

  /**
   * Deletes the first occurrence of a value in the list.
   * @param value The value to delete.
   */
  public delete(value: T): void {
    if (!this.head) {
      console.warn('List is empty. No element to delete.');
      return;
    }

    if (this.head.value === value) {
      this.head = this.head.next;
      return;
    }

    let prev: ListNode<T> | null = null;
    let current: ListNode<T> | null = this.head;

    while (current && current.value !== value) {
      prev = current;
      current = current.next;
    }

    if (!current) {
      console.warn('Value not found in list.');
      return;
    }

    if (prev) {
      prev.next = current.next;
    }
  }

  /**
   * Finds the first node containing the given value.
   * @param value The value to search for.
   * @returns The found node, or null if not found.
   */
  public find(value: T): ListNode<T> | null {
    let current = this.head;
    while (current) {
      if (current.value === value) return current;
      current = current.next;
    }
    return null;
  }

  /**
   * Converts the linked list into a standard array.
   * @returns An array of all values in the list.
   */
  public toArray(): T[] {
    const result: T[] = [];
    let current = this.head;
    while (current) {
      result.push(current.value);
      current = current.next;
    }
    return result;
  }

  /**
   * Checks whether the list is empty.
   * @returns True if the list has no elements, false otherwise.
   */
  public isEmpty(): boolean {
    return this.head === null;
  }

  /**
   * Returns the number of nodes in the list.
   * @returns The size of the list.
   */
  public size(): number {
    let count = 0;
    let current = this.head;
    while (current) {
      count++;
      current = current.next;
    }
    return count;
  }

  /**
   * Removes all elements from the list.
   */
  public clear(): void {
    this.head = null;
  }
}
