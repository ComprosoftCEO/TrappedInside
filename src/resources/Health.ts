const MAX_HEALTH = 100;

/**
 * Stores information about the player health
 */
export class Health {
  private health = MAX_HEALTH;

  public getHealthPercentLeft(): number {
    return this.health / MAX_HEALTH;
  }

  public heal(amount: number): void {
    this.health = Math.min(this.health + amount, MAX_HEALTH);
  }

  public hit(amount: number): void {
    this.health = Math.max(this.health - amount, 0);
  }

  public hasHealthLeft(): boolean {
    return this.health > 0;
  }
}
