if [ "$(uname)" == "Darwin" ]; then
    sudo npm install
    cd frontend
    sudo npm install
    cd ..
elif [ "$(expr substr $(uname -s) 1 5)" == "Linux" ]; then
    sudo npm install
    cd frontend
    sudo npm install
    cd ..
elif [ "$(expr substr $(uname -s) 1 10)" == "MINGW32_NT" ]; then
    npm install
    cd frontend
    npm install
    cd ..
fi