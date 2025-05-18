const Food = {
    gridSize: 20,
    position: null,

    getRandomPosition: function() {
        return {
            x: Math.floor(Math.random() * this.gridSize),
            y: Math.floor(Math.random() * this.gridSize)
        };
    },

    respawn: function() {
        this.position = this.getRandomPosition();
    },

    init: function() {
        this.position = this.getRandomPosition();
    }
};