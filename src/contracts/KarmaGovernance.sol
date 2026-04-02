// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "./StatusNetworkApp.sol";

/// @title KarmaGovernance — Karma-weighted voting
contract KarmaGovernance {
    IKarma public immutable karma;

    mapping(uint256 => int256) public proposalVotes;
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    event Voted(uint256 indexed proposalId, address indexed voter, bool support, uint256 weight);

    constructor(address _karma) {
        karma = IKarma(_karma);
    }

    function vote(uint256 proposalId, bool support) external {
        require(!hasVoted[proposalId][msg.sender], "Already voted");
        uint256 weight = karma.balanceOf(msg.sender);
        require(weight > 0, "No Karma — cannot vote");
        proposalVotes[proposalId] += support ? int256(weight) : -int256(weight);
        hasVoted[proposalId][msg.sender] = true;
        emit Voted(proposalId, msg.sender, support, weight);
    }
}
