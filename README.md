# Introduction

A simple DApps that containing and using API from [1INCH](https://docs.1inch.io/) - [Defillama](https://defillama.com/docs/api) - [Alchemy](https://docs.alchemy.com/)

# Environment Setup

Install fundamental environments including node, and git
 
### Install nodejs

```javascripts
https://nodejs.org/en/download
```

### Install git

##### Windows

```javascripts
https://gitforwindows.org/
```

##### MAC

```javascripts
https://sourceforge.net/projects/git-osx-installer/files/git-2.23.0-intel-universal-mavericks.dmg/download
```

##### Linux Debian/Ubuntu
It's a good idea to make sure you're running the latest version. Run the following command
```javascripts
sudo apt-get update
```
```javascripts
sudo apt-get install git-all
```

### Download Source Code

Open your terminal and run the following command or just download the `zip file`
```javascripts
git clone https://github.com/redoti/web3-dex.git
```
### Download Metamask

![img](https://images.ctfassets.net/9sy2a0egs6zh/7wNAiVbgssyrL7UY3xd4FY/2a15d3f50b85a34e8443c08c49579191/home-hero-dark.png?w=1920&q=80&fm=webp#only-dark)

> Metamask is a crypto wallet & gateway to blockchain apps

```javascripts
https://metamask.io/download/
```

# Deploy the Source Code 
Before running anything, you'll need to install the dependencies:
```javascripts
npm install
```
### Running the interface locally
Run on `development environment` if you want to deploy the source code directly to the `development server`. Navigate to [http://localhost:3000].
```javascripts
npm run start
```
### Creating a production build
Run on `production environment` if you want to deploy the source code directly to the `production server`
```javascripts
npm run build
```

# Guidelines

### Swap Page
This is a very simple UI that everyone will be able to interact with the Dapps.

![img](https://cdn.discordapp.com/attachments/994806484942721025/1123115275076763648/image.png)

On this page you can do the transaction between the 2 tokens.

| Name Interfaces | Explanation                         			   |
| --------------- | -------------------------------------------------- |
| Connect         |  `connect` Metamask Wallet |
| Approve         |  Give `approval` for Dapps to spend source token   |
| Swap            |  `Swap` transaction between the 2 tokens           |
| Arbitrum        | This indicates that it is an `Arbitrum` Mainnet    |
| Portfolio	      | Move to `portfolio` page 						   |

#

### Portfolio Page

![img](https://cdn.discordapp.com/attachments/994806484942721025/1123130413024546906/image.png)

On this page you can watch your portfolio on Arbitrum Mainnet. You need to connect your `Metamask` Wallet to see the table.

# How to Swap

If you want to do a transaction, you need to give `approval` for Dapps first

https://github.com/redoti/web3-dex/assets/49931988/ae9f546e-2e4b-4065-a23a-0a449154b874





