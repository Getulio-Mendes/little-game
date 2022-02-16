const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
var hold;
var moving = false;

const projectileVel = 5;
var damage = 1;
const playerSpeed = 5;

var enemySpeed = 2;
var enemyHp = 3;

var shoots = [];
var enemies = [];
var particles = [];

var player = {
    x : canvas.width/2,
    y : canvas.height - 50,
    hp : 50
}
var score = 0;
var level = 1;

function draw(){
    // print player
    ctx.beginPath();

    ctx.fillStyle = "#F55";
    ctx.arc(player.x,player.y,15,0,Math.PI *2);
    ctx.fill();

    ctx.fillStyle = "#555";
    ctx.fillRect(player.x -5,player.y -20,10,10);
   
    // print score, level and Hp
    ctx.fillStyle = "#FFF";
    ctx.font = "18px Arial";
    ctx.fillText(`Score ${score}`,canvas.width/2 - 30,20);
    ctx.fillText(`HP ${player.hp}`,40,20);
    ctx.fillText(`Level ${level}`,canvas.width-30,20);

    shoots.forEach(function(projectile){
        ctx.beginPath();
        ctx.arc(projectile.x,projectile.y,5,0,Math.PI *2);
        ctx.fillStyle = "#cfc";
        ctx.fill();
    })

    enemies.forEach(function(enemy){
        ctx.beginPath();
        ctx.arc(enemy.x,enemy.y,enemy.displaySize,0,Math.PI *2);

        ctx.fillStyle = enemy.color;
        ctx.fill();

        // draw enemy hp
        ctx.font = `${enemy.size*1.5}px Arial`;
        ctx.textAlign = "center";
        ctx.fillStyle = "#FFF"
        ctx.fillText(`${enemy.hp}`,enemy.x,enemy.y + enemy.size *0.6);
        
    })

    particles.forEach(function(particle){
        ctx.beginPath();
        ctx.fillStyle = particle.color;
        ctx.arc(particle.x,particle.y,particle.size,0,2*Math.PI);
        ctx.fill();
    })    
}

function shoot(e){
 
    let x = e.clientX-canvas.offsetLeft;
    let y = e.clientY-canvas.offsetTop;

    // get the algle between player position and click
    const angle = Math.atan2(y-(player.y-20),x-player.x);
    const velocity = {
        x : Math.cos(angle) * projectileVel,
        y : Math.sin(angle) * projectileVel
    }

    shoots.push({
        x : player.x,
        y : player.y-20,
        velocity
    })
}

function move(e){
    switch(e.key){
        case "a":
            if(player.x > 15)
                player.x -= playerSpeed;
            break;
        case "d":
            if(player.x < canvas.width-15)
            player.x += playerSpeed;
            break;
    }
}

function spawn(){
    let x = Math.random() * canvas.width;
    let y = 0;
    let size = Math.random() * 25 + 9;
    let hp;

    if(size >= 30){
        hp = Math.floor(enemyHp * 1.5);
    }
    else if(size >= 20){
        hp = enemyHp;
    }
    else if(size >= 14){
        hp = Math.floor(0.75 * enemyHp);
    }
    else if(size >= 8){
        hp = Math.floor(0.5 * enemyHp);
    }
    
    let color = `hsl(${Math.random() * 360},50%,50%)`;

    enemies.push({
        x : x,
        y : y,
        size : size,
        displaySize: size,
        initialSize: size,
        hp : hp,
        value : hp,
        color: color
    });
}

function update(){
    ctx.fillStyle ="rgba(26, 0, 87,0.3)";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    shoots.forEach(function(projectile,i){
        projectile.x += projectile.velocity.x;
        projectile.y += projectile.velocity.y;

        // remove errats
        if(projectile.x >= canvas.width || projectile.y >= canvas.height){
            shoots.splice(i,1);
        }
        if(projectile.x <= 0 || projectile.y <= 0){
            shoots.splice(i,1);
        }

        enemies.forEach(function(enemy,j){
            let Dx = enemy.x - projectile.x;
            let Dy = enemy.y - projectile.y;
            let distance = Math.sqrt(Dx*Dx + Dy*Dy)

            if(distance <= enemy.size + 5){
                // removes hp,size and projectile
                enemy.hp -= damage;

                if(enemy.size > 14)
                    enemy.size -= 5;

                shoots.splice(i,1);
                // kill enemy
                if(enemy.hp <= 0){
                    enemies.splice(j,1);
                    score += enemy.value;

                    for(let i=0; i < Math.floor(enemy.initialSize);i++){
                        particles.push({
                            x: enemy.x,
                            y: enemy.y,
                            size: Math.random() * 3 + 1,
                            vel: {
                                x: Math.random() * 6 - 3,
                                y: Math.random() * 6 - 3
                            },
                            color: enemy.color,
                            life: 30
                        })
                    }
                }
            }
        })
    })

    enemies.forEach(function(enemy,i){
        let angle = Math.atan2(
            (player.y)-enemy.y,
            (player.x)-enemy.x
        );

        if(enemy.displaySize != enemy.size){
            enemy.displaySize --;
        }

        enemy.x += Math.cos(angle) * enemySpeed/1.5;
        enemy.y += enemySpeed;

        let Dx = enemy.x - player.x;
        let Dy = enemy.y - player.y;
        let distance = Math.sqrt(Dx*Dx + Dy*Dy);

        if(distance <= enemy.size + 15){
            enemies.splice(i,1);
            player.hp -= enemy.hp;
        }

        // remove outsiders
        if(enemy.x >= canvas.width || enemy.y >= canvas.height){
            enemies.splice(i,1);
        }
        if(enemy.x <= 0 || enemy.y <= 0){
            enemies.splice(i,1);
        }
    })

    particles.forEach(function(particle,i){
        particle.x += particle.vel.x;
        particle.y += particle.vel.y;

        particle.life--;
        if(particle.life <= 0){
            particles.splice(i,1);
        }
    })

    if(Math.floor(score/50) + 1 > level){
        level++;
        enemySpeed += 1;
        enemyHp += 2;
        damage++;
    }

    draw();

    if(player.hp <= 0){
        console.log("Game over");
    }
    else{
        window.requestAnimationFrame(update);;
    }

    
}

function init(){
    draw();

    window.addEventListener("click",function(e){
        shoot(e);
    })

    window.addEventListener("keypress",move);

    setInterval(spawn,500);

    window.requestAnimationFrame(update);
}

init();