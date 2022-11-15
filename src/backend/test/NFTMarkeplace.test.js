const { expect } = require("chai");

describe("NFTMarkeplace", async function(){
    let deployer, addr1, addr2, nft, marketplace
    let feePercent = 1
    let URI = "Sample URI"
    beforeEach(async function() {
        // Get contract factories
        const NFT = await ethers.getContractFactory("NFT");
        const Marketplace = await ethers.getContractFactory("Marketplace");
        // Get signers
        [deployer, addr1, addr2] = await ethers.getSigners()
        // Deploy contracts
        nft = await NFT.deploy();
        marketplace = await Marketplace.deploy(feePercent);
    });
    describe("Deployment", function() {
        it("Should track feeAccount and feePercent of the markeplace", async function () {
            expect(await marketplace.feeAccount()).to.equal(deployer.address);
            expect(await marketplace.feePercent()).to.equal(feePercent);
        });
        it("Should track name and symbol of NFT collection", async function () {
            expect(await nft.name()).to.equal("DApp NFT");
            expect(await nft.symbol()).to.equal("DAPP");
        })
    })
    describe("Minting NFTs", function () {
        it("Should track each minted NFT", async function () {
            // addr1 mints an nft
            await nft.connect(addr1).mint(URI)
            expect(await nft.tokenCount()).to.equal(1);
            expect(await nft.balanceOf(addr1.address)).to.equal(1);
            expect(await nft.tokenURI(1)).to.equal(URI);
            // addr2 mints an nft
            await nft.connect(addr2).mint(URI)
            expect(await nft.tokenCount()).to.equal(2);
            expect(await nft.balanceOf(addr2.address)).to.equal(1);
            expect(await nft.tokenURI(2)).to.equal(URI);
          });
    })
    describe("Making marketplace items", function () {
        beforeEach(async function () {
            // addr1 mints an nft
            await nft.connect(addr1).mint(URI)
            // addr1 approves marketplace to spend nft 
            await nft.connect(addr1).setApprovalForAll(marketplace.address, true)
        })
        it("Should track newly created item, transfer nft from seller to marketplace and emit Offered event", async function () {
            // addr1 offer their nft at a price of 1 ether
            await expect(marketplace.connect(addr1).makeItem(nft.address, 1, toWei(1)))
            .to.emit(marketplace, "Offered")
            .withArgs(
                1,
                nft.address,
                1,
                toWei(1),
                addr1.address
            )
        })
    })      
})
