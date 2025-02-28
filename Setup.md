# Setup Fabricait Dev Environment
## Installation
Make sure you have the following things installed:
- WSL2 (Windows Subsystem for Linux): [WSL Install](https://learn.microsoft.com/en-us/windows/wsl/install)
- Docker Desktop: [Docker Startup Guide](https://www.docker.com/get-started/)
- VS Code: [VS Code Install](https://code.visualstudio.com/download)
  - Install the `Dev Containers` extension for vscode

## Get the repo
- Navigate to whatever directory you choose to use in WSL (you could probably just stay in the default `home` directory).
- Clone the repo
  - `git clone `
- Setup git config
  - `git config --global user.email <your-email>`
  - `git config --global user.name <your-username>`

## Run the Project
- Check that docker is correctly setup in WSL
  - `docker -v`
  - Expected output: `Docker version 27.4.0, build bde2b89`
- Run the data migration for the database
  - `docker compose run --rm server npx prisma generate`
- Run the containers (After one time, this is the only command you'll need to start the project.)
  - `docker compose up`
- To shut down the containers:
  - `docker compose down`

## Connect to the project in vscode
- From the WSL terminal, run `code .` from inside the `fabricait` directory.
- Once VS Code is open, if the docker containers are running, there should be a popup in the bottom right that prompts you to reopen the workspace in a container.
- You're done!