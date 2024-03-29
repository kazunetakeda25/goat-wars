class Random {
    static shuffle<T>(array:T[]):T[] {
        let currentIndex = array.length,  randomIndex;
      
        // While there remain elements to shuffle...
        while (currentIndex != 0) {
      
          // Pick a remaining element...
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex--;
      
          // And swap it with the current element.
          [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
        }
      
        return array;
    }

    static randString(n:number = 8):string{
    
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for(var i=0; i < n; i++)
    {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
}
}
class Vec2 {

    x: number;
    y: number;

    constructor(x: number = 0.0, y: number = 0.0) {
        this.x = x;
        this.y = y;
    }

    add(other: Vec2): Vec2 {
        return new Vec2(
            this.x + other.x,
            this.y + other.y
        );
    }

    adds(other: number): Vec2 {
        return new Vec2(
            this.x + other,
            this.y + other
        );
    }

    sub(other: Vec2): Vec2 {
        return new Vec2(
            this.x - other.x,
            this.y - other.y
        );
    }

    subs(other: number): Vec2 {
        return new Vec2(
            this.x - other,
            this.y - other
        );
    }

    mul(other: Vec2): Vec2 {
        return new Vec2(
            this.x * other.x,
            this.y * other.y
        );
    }

    muls(other: number): Vec2 {
        return new Vec2(
            this.x * other,
            this.y * other
        );
    }

    div(other: Vec2): Vec2 {
        return new Vec2(
            this.x / other.x,
            this.y / other.y
        );
    }

    divs(other: number): Vec2 {
        return new Vec2(
            this.x / other,
            this.y / other
        );
    }

    abs(other: Vec2): Vec2 {
        return new Vec2(
            Math.abs(this.x - other.x),
            Math.abs(this.y - other.y)
        );
    }

    equal(other: Vec2): boolean {
        return (this.x == other.x && this.y == other.y);
    }

    dot(other: Vec2): number {
        return this.x * other.x + this.y * other.y;
    }

    length(): number {
        return Math.sqrt(this.dot(this));
    }

    squareLength(): number {
        return this.dot(this);
    }

    normalize(): Vec2 {
        return this.muls(1.0 / this.length());
    }

    
      

}

const deg2rad = (deg: number): number => {
    return deg * (Math.PI / 180.0);
}

const rad2deg = (rad: number): number => {
    return rad * (180.0 / Math.PI);
}

const lerp = (a: number, b: number, t: number): number => {
    return (1 - t) * a + t * b;
}

export { Vec2, deg2rad, rad2deg, lerp, Random };