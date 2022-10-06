const express = require('express');
const app = express();
const port = 3002;

const path = require('path');

app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/static/'))
})

app.listen(port, () => {
    console.log(`Myer login page listening on port ${port}`)
});


// const express = require('express')
// const app = express()
// const port = 3001

// const path = require('path');

// app.use('/static', express.static(path.join(__dirname, 'public')))

// app.get('/', (req, res) => {

//   res.sendFile(path.join(__dirname, '/static/'))
// })

// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`)
// })