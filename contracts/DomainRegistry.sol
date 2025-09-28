// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title DomainRegistry
 * @notice Ethereum-based registry that anchors DNS-style records on-chain.
 *         Registration is tokenless but enforces ownership, TTL, and record integrity constraints.
 */
contract DomainRegistry is Ownable {
    struct Record {
        string value;
        uint64 ttl;
        uint64 lastUpdated;
    }

    struct DomainData {
        address owner;
        mapping(bytes32 => Record) records;
        uint64 expiry;
    }

    uint64 public immutable defaultTtl;
    uint64 public immutable registrationPeriod;
    mapping(bytes32 => DomainData) private domains;

    event DomainRegistered(string indexed label, address indexed owner, uint64 expiry);
    event DomainRenewed(string indexed label, uint64 expiry);
    event DomainTransferred(string indexed label, address indexed newOwner);
    event RecordUpdated(string indexed label, bytes32 indexed recordType, string value, uint64 ttl);

    error DomainAlreadyRegistered();
    error DomainExpired();
    error InvalidTtl();

    constructor(uint64 _defaultTtl, uint64 _registrationPeriod) Ownable(msg.sender) {
        require(_defaultTtl > 0, "ttl");
        require(_registrationPeriod > 0, "period");
        defaultTtl = _defaultTtl;
        registrationPeriod = _registrationPeriod;
    }

    error Unauthorized();

    modifier onlyDomainOwner(string calldata label) {
        DomainData storage domain = domains[_labelHash(label)];
        if (domain.owner == address(0) || domain.expiry < _now()) {
            revert DomainExpired();
        }
        if (domain.owner != msg.sender) {
            revert Unauthorized();
        }
        _;
    }

    function register(string calldata label, address registrant) external onlyOwner {
        bytes32 namehash = _labelHash(label);
        DomainData storage domain = domains[namehash];
        if (domain.owner != address(0) && domain.expiry >= _now()) {
            revert DomainAlreadyRegistered();
        }
        domain.owner = registrant;
        domain.expiry = _now() + registrationPeriod;
        emit DomainRegistered(label, registrant, domain.expiry);
    }

    function renew(string calldata label) external onlyDomainOwner(label) {
        DomainData storage domain = domains[_labelHash(label)];
        domain.expiry = _now() + registrationPeriod;
        emit DomainRenewed(label, domain.expiry);
    }

    function transferDomain(string calldata label, address newOwner) external onlyDomainOwner(label) {
        DomainData storage domain = domains[_labelHash(label)];
        domain.owner = newOwner;
        emit DomainTransferred(label, newOwner);
    }

    function setRecord(
        string calldata label,
        bytes32 recordType,
        string calldata value,
        uint64 ttl
    ) external onlyDomainOwner(label) {
        if (ttl == 0) {
            revert InvalidTtl();
        }
        DomainData storage domain = domains[_labelHash(label)];
        Record storage record = domain.records[recordType];
        record.value = value;
        record.ttl = ttl;
        record.lastUpdated = uint64(_now());
        emit RecordUpdated(label, recordType, value, ttl);
    }

    function getRecord(
        string calldata label,
        bytes32 recordType
    ) external view returns (Record memory) {
        DomainData storage domain = _requireLiveDomain(label);
        return domain.records[recordType];
    }

    function getDomainOwner(string calldata label) external view returns (address) {
        DomainData storage domain = _requireLiveDomain(label);
        return domain.owner;
    }

    function getDomainExpiry(string calldata label) external view returns (uint64) {
        DomainData storage domain = _requireLiveDomain(label);
        return domain.expiry;
    }

    function isLive(string calldata label) external view returns (bool) {
        DomainData storage domain = domains[_labelHash(label)];
        return domain.owner != address(0) && domain.expiry >= _now();
    }

    function _requireLiveDomain(string calldata label) internal view returns (DomainData storage) {
        bytes32 namehash = _labelHash(label);
        DomainData storage domain = domains[namehash];
        if (domain.owner == address(0) || domain.expiry < _now()) {
            revert DomainExpired();
        }
        return domain;
    }

    function _labelHash(string calldata label) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(label));
    }

    function _now() internal view returns (uint64) {
        return uint64(block.timestamp);
    }
}
