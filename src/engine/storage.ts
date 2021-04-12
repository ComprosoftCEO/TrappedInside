// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace LocalStorage {
  /**
   * Save an object into the browser local storage.
   * Automatically serializaes the JSON to a string.
   *
   * @param key The key to save the object in
   * @param value Value for the object
   */
  export function saveObject<T>(key: string, value: T): void {
    window.localStorage.setItem(key, JSON.stringify(value));
  }

  /**
   * Load an object from the browser local storage.
   * Automatically underializes the object from a string.
   *
   * Throws an exception if T is not in the database and no default value is provided.
   * There is no check to make sure the returned T is actually valid!!!
   *
   * @param key The key of the object to load
   * @param def Optionally specify the default value to load
   */
  export function loadObject<T>(key: string, def?: T): T {
    const value = window.localStorage.getItem(key);
    if (value === null) {
      if (typeof def !== 'undefined') {
        return def;
      } else {
        throw new Error(`Key '${key}' does not exist in local storage`);
      }
    }

    return JSON.parse(value);
  }

  /**
   * Remove an object from the local storage
   *
   * @param key The key of the object to remove
   */
  export function removeObject(key: string): void {
    window.localStorage.removeItem(key);
  }

  /**
   * Test if a value exists in the local storage
   * @param key The key to test
   */
  export function exists(key: string): boolean {
    return window.localStorage.getItem(key) !== null;
  }

  /**
   * Clear all entires from the local storage
   */
  export function clear(): void {
    window.localStorage.clear();
  }
}

/**
 * Allows you to store global variables associated with the game.
 * This is constructed internally by the game engine.
 */
export class ResourceManager {
  private resources: Record<string, unknown> = {};

  /**
   * Set a resource in the database
   *
   * @param name Name of the resource to set
   * @param value Value of the resource to set
   */
  public setResource<T>(name: string, value: T): void {
    this.resources[name] = value;
  }

  /**
   * Gets a resource from the global resource database.
   * Throws an exception if the resource is NOT found and no default is specified.
   *
   * Does NOT check to make sure the returned type is actually valid.
   *
   * @param name Name of the resource to get
   * @param def Optionally specify a default value
   * @returns Returned resource
   */
  public getResource<T>(name: string, def?: T): T {
    const resource = this.resources[name];
    if (typeof resource === 'undefined') {
      if (typeof def !== 'undefined') {
        return def;
      } else {
        throw new Error(`No such resource '${name}'`);
      }
    }

    return resource as T;
  }

  /**
   * Delete a resource from the game.
   * @param name Resource to delete
   */
  public deleteResource(name: string): void {
    delete this.resources[name];
  }

  /**
   * Test if a resource exists
   * @param key Resource to get
   */
  public exists(key: string): boolean {
    return typeof this.resources[key] !== 'undefined';
  }

  /**
   * Clear all resources from the list
   */
  public clear(): void {
    this.resources = {};
  }
}
