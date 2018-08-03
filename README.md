AI bot that will play ping pong in browser. This uses tensorflowjs to load the trained model in javascript. The model is trained with Keras. To play the game, clone or download the repository. Make sure you are connected to the internet. Now just open *game.html* and play. 

The repository already contains a trained model. But if you want to train and load your own model you'll need to install these dependencies for *training.py*.

```bash
#install dependencies

#install keras
pip install keras

#install tensorflowjs
pip install tensorflowjs

#install numpy
pip install numpy
```

To load your own trained model in *game.js*, you'll need to either host the trained model on the same server you're running it from (loadModel uses an http/https request), or you need the server hosting it to have CORS enabled.
