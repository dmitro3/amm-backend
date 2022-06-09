import { Comparable } from 'src/modules/matching-engine/entity/comparable';

export class Objects {
  public static equals(object1: Comparable, object2: Comparable): boolean {
    if (!object1 && !object2) {
      return true;
    }
    if ((!object1 && object2) || (object1 && !object2)) {
      return false;
    }

    return object1.equals(object2);
  }
}
