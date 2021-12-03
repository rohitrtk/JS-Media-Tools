# Timestamper

## How to Install

1. Clone/download the repo and open it in your code editor
2. Run `npm install` in the repo to install node modules
3. Once node modules are installed you can either:
    1. Run `npm run start` in a terminal to run the program
    2. Run `npm run make` to make the application. You can then navigate to `out/make` where there will be a setup executable which you can run to install the application and then run it.

## Usage

Firstly, select your audio file using the **Select Audio** button at the top, video files work too. Once a file has been selected, the **Play Audio** and **Export Timestamps** buttons will be enabled. If **Play Audio** is pressed, the audio will play at a regular playback speed and can be visualized on the canvas. If **Export Timestamps** is pressed, you will be prompted to select a location to save the JSON file containing the timestamps for the file. Once a location is selected, the audio will play at 16x the playback speed. Upon complete there will be a file called `timestamps.json` at the specified location. You can change the threshold value which will change what the program determines as silent. A higher threshold makes it more sensitive while a lower threshold makes it less sensitive. The default value is **250**.
