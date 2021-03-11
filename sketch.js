//--------------------Creatutes-------------------------
let blobs = []
let food = []
let predators = []


//--------------------Simulation Parameters-------------------------
let numOfBlobs = 30    
let num_predator = 2
let num_food = 100

let reproduce_ammount = 3
let predator_reproduce = 2
let mutation_amount = 10

let food_time = 30000
let food_decrease = 0

let health_gain = 100
let persue_time = 15000
let persue_time_decrease = 20
let health_loss = 300000

let size_cost = 2
let speed_cost = 3
let sense_cost = 1

let predator_scared_size = 2


//--------------------Populate Screen-------------------------
function setup() {
  createCanvas(screen.width-1, screen.height-1);

  for (let i = 0; i < numOfBlobs; i++){
    populate_blobs()
  }
  for (let i = 0; i < num_predator; i++){
    populate_predator()
  }
  populate_food(food, num_food)
}


//--------------------Move Creatures-------------------------
function draw() {
  background(240);
  for(let i = 0; i < food.length; i++){
    food[i].display()
  }
  let done = []

  //find and move toward nearest food
  for(let j = 0; j < blobs.length; j++){
    results = nearest(j)
    min_distance = results[0] 
    closest_index = results[1]
    
    if (min_distance <= blobs[j].distance/2 && blobs[j].health <200){
      blobs[j].move(food[closest_index])

    }else{

      //if no food in view radius move randomly
      blobs[j].move_random()
    }
    if (blobs[j].health < 0){
      done.push(j)
    }
    blobs[j].display()
  }
  dec_value = 0

  //handle creature death
  for (let i = 0; i < done.length; i++){
    bob = blobs[done[i]]
    food.push(new Food(bob.location.x,bob.location.y))
  }
  for (let i = 0; i < done.length; i++){
    
    blobs.splice(done[i]-dec_value,1)
    dec_value ++;
  }

  //Move Predator
  let predator_done = []
  for (let i=0; i<predators.length;i++){
    predators [i].change_target()
    if (predators[i].health < 0){
      predator_done.push(i)
    }
    predators[i].display()
  }
  
  //handle predator death
  let dec = 0
  for (let i = 0; i < predator_done.length; i++){
    bob = predators[predator_done[i]]
    food.push(new Food(bob.location.x,bob.location.y))
  }
  for (let i = 0; i < predator_done.length; i++){
    predators.splice(predator_done[i]-dec,1)
    dec ++;
  }
}


//--------------------Find nearest Food-------------------------
function nearest(j){
  let min_distance = 100000
  let closest_index 
  for (let i = 0; i < food.length; i++){
      food_x = food[i].x
      food_y = food[i].y
      new_x = food_x - blobs[j].location.x
      new_y = food_y - blobs[j].location.y
      distance = (sqrt(new_x**2+new_y**2))-blobs[j].r
      if (distance < min_distance) {
        min_distance = distance
        closest_index = i
      }
    }
    return [min_distance, closest_index]
}


//--------------------Creature Class-------------------------
class Dot {
  constructor(x,y,r,s,red,green,blue,distance) {
    this.r = r
    this.x = x
    this.y = y
    this.red = red
    this.persue_time = persue_time
    this.distance = distance
    this.green = green
    this.blue = blue
    this.speed = s;
    this.xoff = random(0,50)
    this.yoff = random(0,50)
    this.eaten = 0
    this.location = createVector(this.x,this.y)
    this.health = 255
    this.target = blobs[0]
  }

  // checking if off the screen
  borders(){
    if (this.location.x < -this.r) this.location.x = width+this.r;
    if (this.location.y < -this.r) this.location.y = height+this.r;
    if (this.location.x > width+this.r) this.location.x = -this.r;
    if (this.location.y > height+this.r) this.location.y = -this.r;
    
  }

  //moving according to perlin noise
  move_random() {
    let vx = map(noise(this.xoff),0,1,-this.speed,this.speed);
    let vy = map(noise(this.yoff),0,1,-this.speed,this.speed);
    let velocity = createVector(vx,vy)
    this.xoff += 0.01;
    this.yoff += 0.01;
    this.location.add(velocity)

    //decreate health according to speed, sense distance and size
    this.health -=   (this.r ** 3 + this.speed ** 2 + this.distance)/health_loss
    this.borders()

  }

  reproduce(){
    add_blob(this.location.x,this.location.y,this.r,this.speed,this.distance)
  }

  //check if colliding with target and eat 
  eat(target){
    new_x = target.x - this.location.x
    new_y = target.y - this.location.y
    distance = (sqrt(new_x**2+new_y**2))
    noFill()
    stroke(0)
    if (distance-(this.r/2) <= 0){
      let index = food.indexOf(target)
      food.splice(index,1)
      this.health += health_gain
      this.eaten++
      if (this.eaten >= reproduce_ammount){
        this.eaten = 0
        this.reproduce()
        
      }
    }
  }

  // Move toward target
  move(target){
    if (target != null){
      let xspeed = (target.x-this.location.x)/2;
      let yspeed = (target.y-this.location.y)/2;
      let velocity = createVector(xspeed,yspeed)
      velocity.limit(this.speed/2)
      this.location.add(velocity)
      stroke(0)
      fill(0)
      line(target.x,target.y,this.location.x,this.location.y)
      this.borders()

      //decreate health according to sensory-distance, speed and size
      this.health -= (this.r ** 3 + this.speed ** 2 + this.distance)/health_loss
      this.eat(target)
    }
  }

  //drawing the creature
  display() {
    ellipseMode(CENTER)
    
    stroke(this.red,this.green,this.blue,this.health)
    noFill()

    ellipse(this.location.x,this.location.y,this.distance,this.distance)

    stroke(this.red,this.green,this.blue,this.health)
    fill(this.red,this.green,this.blue,this.health)
    
    ellipse(this.location.x, this.location.y, this.r,this.r)
  }
 }


//--------------------Predator Class-------------------------
class Predator extends Dot{

  //create new predator
  make(){
    add_predator(this.location.x,this.location.y,this.r,this.speed,this.distance)
  }

  //eat target and reproduce
  kill(target){
    let new_x = target.location.x - this.location.x
    let new_y = target.location.y - this.location.y
    let dis = (sqrt(new_x**2+new_y**2))
    noFill()
    stroke(0)
    if (dis-(this.r/2) <= 0){
      let index = blobs.indexOf(target)
      blobs.splice(index,1)
      this.persue_time = 0
      this.health += health_gain
      this.eaten++
      if (this.eaten >= predator_reproduce){
        this.eaten = 0
        this.make()
      }
    }
  }

  //if target to fast, far away or too big change target
  change_target(){
    try{
      this.persue_time -= persue_time_decrease
      let res = nearest_blob(this)
      if (this.persue_time <= 0){
        this.persue_time = persue_time
        let blob = res[0]
        this.target = blob
      }
      if (dist(this.target.location.x,this.target.location.y,this.location.x,this.location.y) <= this.distance && this.health < 2000 && this.target.r/predator_scared_size < this.r){
        this.catch(this.target)
        line(this.location.x,this.location.y,this.target.location.x,this.target.location.y)
      }else{
        this.move_random()
      }

    }
    catch(err){
       console.log(err)
       let res = nearest_blob(this)
       if (res[0] != null){
         let blob = res[0]
         this.target = blob
         this.persue_time = 0
       }else{
         this.move_random()
       }
    } 
  }

  //move toward target
  catch(target){
    if (target != null){
      let xspeed = (target.location.x-this.location.x);
      let yspeed = (target.location.y-this.location.y);
      let velocity = createVector(xspeed,yspeed)
      velocity.limit(this.speed/2)
      this.location.add(velocity)
      stroke(0)
      fill(0)
      this.borders()

      //decrease health according to size, speed and sensory-distance
      this.health -= (this.r ** 3 + this.speed ** 2 + this.distance)/health_loss
      this.display()
      this.kill(target)
    }
  }
}

//--------------------Find Closest Creature-------------------------
function nearest_blob(p){
    let closest_blob
    let min_distance = 100000
    let closest_index
    for (let j = 0; j < blobs.length; j++){
      let blob_x = blobs[j].x
      let blob_y = blobs[j].y
      let distan  = dist(blob_x,blob_y,p.location.x,p.location.y)
      if (distan < min_distance){
        min_distance = distan
        closest_index = j
        closest_blob = blobs[closest_index]
      }
    }
    if (closest_blob) {return [closest_blob, min_distance]}
    else{return [null, 1000000000]}
}

//--------------------Food Class-------------------------
class Food{
  constructor(x,y){
    this.x = x;
    this.y = y;
  }

  display(){
    fill(150)
    stroke(0)
    ellipse(this.x,this.y,7,7)
  }
}


//--------------------Create Random Creatures at start-------------------------
function populate_blobs(){
  r = random(10,60)
  blobs.push(new Dot(random(0,width),random(0,height),r,random(1,10),0,0,0,random(20,250)+r))
}

//--------------------Add Creature with mutation chance-------------------------
function add_blob(x,y,rad,spee,dist){
  r = random(10,60)
  blobs.push(new Dot(x,y,rad+random(-mutation_amount,mutation_amount),spee+random(-mutation_amount,mutation_amount),0,0,0,dist+random(-mutation_amount*10,mutation_amount*10)))
}

//--------------------Randomly create predators at start-------------------------
function populate_predator(){
  r = random(20,60)
  predators.push(new Predator(random(0,width),random(0,height),r,random(7,15),255,0,0,random(200,250)+r))
}

//--------------------Add Predator with mutation chance-------------------------
function add_predator(x,y,rad,spee,dist){
  r = random(10,60)
  predators.push(new Predator(x,y,rad+random(-mutation_amount,mutation_amount),spee+random(-mutation_amount,mutation_amount),255,0,0,dist+random(-mutation_amount*10,mutation_amount*10)))
}

//--------------------Randomly Create Food At Start-------------------------
function populate_food(food_array, num){
  for (let i = 0; i < num; i++){
    food_array.push(new Food(random(0,width),random(0,height)))
  }
  num_food -= food_decrease
  if (num_food < 5){
    num_food = 5
  }
}

//--------------------Populate food every x seconds-------------------------
setInterval( function() { populate_food(food,num_food); }, food_time );