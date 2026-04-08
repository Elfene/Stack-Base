// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract StackBase is ERC721, Ownable {
    using Strings for uint256;

    uint256 private _nextTokenId;

    struct ScoreEntry {
        address player;
        uint256 score;
        uint256 timestamp;
    }

    mapping(address => bool) public hasNFT;
    mapping(address => uint256) public playerTokenId;
    mapping(address => uint256) public highScores;
    mapping(address => uint256) public lastCheckIn;
    mapping(address => uint256) public checkInCount;
    mapping(address => uint256) public gamesPlayed;

    ScoreEntry[] public leaderboard;

    event GameStarted(address indexed player, uint256 gameNumber);
    event CheckedIn(address indexed player, uint256 count, uint256 timestamp);
    event NewHighScore(address indexed player, uint256 score);
    event NFTMinted(address indexed player, uint256 tokenId);

    constructor() ERC721("StackBase", "STKB") Ownable(msg.sender) {}

    function play() external {
        gamesPlayed[msg.sender]++;

        if (!hasNFT[msg.sender]) {
            hasNFT[msg.sender] = true;
            uint256 tokenId = _nextTokenId++;
            playerTokenId[msg.sender] = tokenId;
            _mint(msg.sender, tokenId);
            emit NFTMinted(msg.sender, tokenId);
        }

        emit GameStarted(msg.sender, gamesPlayed[msg.sender]);
    }

    function _currentCheckInDay() internal view returns (uint256) {
        return (block.timestamp - 1 hours) / 1 days;
    }

    function canCheckIn(address player) public view returns (bool) {
        if (lastCheckIn[player] == 0) return true;
        uint256 lastDay = (lastCheckIn[player] - 1 hours) / 1 days;
        return _currentCheckInDay() > lastDay;
    }

    function checkIn() external {
        require(canCheckIn(msg.sender), "Already checked in today");
        checkInCount[msg.sender]++;
        lastCheckIn[msg.sender] = block.timestamp;
        emit CheckedIn(msg.sender, checkInCount[msg.sender], block.timestamp);
    }

    function submitScore(uint256 score) external {
        require(score > highScores[msg.sender], "Not a high score");
        highScores[msg.sender] = score;
        _updateLeaderboard(msg.sender, score);
        emit NewHighScore(msg.sender, score);
    }

    function _updateLeaderboard(address player, uint256 score) private {
        for (uint256 i = 0; i < leaderboard.length; i++) {
            if (leaderboard[i].player == player) {
                leaderboard[i] = leaderboard[leaderboard.length - 1];
                leaderboard.pop();
                break;
            }
        }

        ScoreEntry memory entry = ScoreEntry(player, score, block.timestamp);

        if (leaderboard.length == 0) {
            leaderboard.push(entry);
            return;
        }

        uint256 insertIdx = leaderboard.length;
        for (uint256 i = 0; i < leaderboard.length; i++) {
            if (score > leaderboard[i].score) {
                insertIdx = i;
                break;
            }
        }

        leaderboard.push(leaderboard[leaderboard.length - 1]);
        for (uint256 j = leaderboard.length - 1; j > insertIdx; j--) {
            leaderboard[j] = leaderboard[j - 1];
        }
        leaderboard[insertIdx] = entry;

        if (leaderboard.length > 100) {
            leaderboard.pop();
        }
    }

    function getLeaderboard(uint256 limit) external view returns (ScoreEntry[] memory) {
        uint256 len = limit > leaderboard.length ? leaderboard.length : limit;
        ScoreEntry[] memory top = new ScoreEntry[](len);
        for (uint256 i = 0; i < len; i++) {
            top[i] = leaderboard[i];
        }
        return top;
    }

    function getPlayerStats(address player) external view returns (
        uint256 games,
        uint256 best,
        uint256 checkIns,
        uint256 lastCheck,
        bool nft
    ) {
        return (
            gamesPlayed[player],
            highScores[player],
            checkInCount[player],
            lastCheckIn[player],
            hasNFT[player]
        );
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        address owner = ownerOf(tokenId);
        uint256 best = highScores[owner];
        uint256 games = gamesPlayed[owner];

        string memory svg = string(abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">',
            '<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">',
            '<stop offset="0%" stop-color="#667eea"/>',
            '<stop offset="100%" stop-color="#f093a0"/>',
            '</linearGradient></defs>',
            '<rect width="400" height="400" fill="url(#bg)"/>',
            '<rect x="120" y="240" width="160" height="40" rx="4" fill="#4ECDC4" opacity="0.9"/>',
            '<rect x="130" y="195" width="140" height="40" rx="4" fill="#FF6B6B" opacity="0.9"/>',
            '<rect x="140" y="150" width="120" height="40" rx="4" fill="#F7DC6F" opacity="0.9"/>',
            '<rect x="150" y="105" width="100" height="40" rx="4" fill="#85C1E2" opacity="0.9"/>',
            '<text x="200" y="60" text-anchor="middle" font-family="Arial,sans-serif" font-size="32" font-weight="bold" fill="white">StackBase</text>',
            '<text x="200" y="320" text-anchor="middle" font-family="Arial,sans-serif" font-size="18" fill="white" opacity="0.8">Best: ', best.toString(), '</text>',
            '<text x="200" y="348" text-anchor="middle" font-family="Arial,sans-serif" font-size="14" fill="white" opacity="0.6">Games: ', games.toString(), '</text>',
            '<text x="200" y="385" text-anchor="middle" font-family="Arial,sans-serif" font-size="12" fill="white" opacity="0.4">#', tokenId.toString(), '</text>',
            '</svg>'
        ));

        string memory json = string(abi.encodePacked(
            '{"name":"StackBase Player #', tokenId.toString(),
            '","description":"StackBase - 3D Tower Stacking Game on Base","image":"data:image/svg+xml;base64,',
            Base64.encode(bytes(svg)),
            '","attributes":[{"trait_type":"Best Score","value":', best.toString(),
            '},{"trait_type":"Games Played","value":', games.toString(),
            '}]}'
        ));

        return string(abi.encodePacked("data:application/json;base64,", Base64.encode(bytes(json))));
    }

    function withdraw() external onlyOwner {
        (bool success, ) = payable(owner()).call{value: address(this).balance}("");
        require(success, "Withdraw failed");
    }
}
