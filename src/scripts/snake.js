const Snake = {
    body: [
        { x: 10, y: 10 }
    ],
    direction: 'right',

    reset: function() {
        this.body = [{ x: 10, y: 10 }];
        this.direction = 'right';
    },

    move: function(food) {
        const head = { ...this.body[0] };

        switch (this.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }

        this.body.unshift(head);

        if (head.x === food.position.x && head.y === food.position.y) {
            return true;
        }

        this.body.pop();
        return false;
    },

    changeDirection: function(direction) {
        const opposites = {
            'up': 'down',
            'down': 'up',
            'left': 'right',
            'right': 'left'
        };

        if (opposites[direction] !== this.direction) {
            this.direction = direction;
        }
    },

    checkCollision: function(gridSize) {
        const head = this.body[0];
        
        if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
            return true;
        }

        for (let i = 1; i < this.body.length; i++) {
            if (head.x === this.body[i].x && head.y === this.body[i].y) {
                return true;
            }
        }
        return false;
    }
};