// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title WalrusOnlineStorage
 * @notice Walrus 去中心化存储管理合约
 * @dev 管理用户上传到 Walrus 的文件引用（Blob ID），实现链上索引和访问控制
 * 
 * Walrus 是一个去中心化存储网络，本合约负责：
 * 1. 记录文件的 Blob ID（Walrus 存储标识符）
 * 2. 管理文件的所有权和访问权限
 * 3. 提供文件元数据查询功能
 * 4. 支持文件分享和权限控制
 */
contract WalrusOnlineStorage is Ownable {
    
    // 文件信息结构
    struct FileInfo {
        string blobId;           // Walrus Blob ID
        address owner;           // 文件所有者
        string fileName;         // 文件名称
        string fileType;         // 文件类型（image/pdf/json等）
        uint256 fileSize;        // 文件大小（bytes）
        uint256 uploadTime;      // 上传时间戳
        bool isPublic;           // 是否公开访问
        string metadata;         // 额外的元数据（JSON格式）
    }
    
    // 存储：Blob ID => 文件信息
    mapping(string => FileInfo) public files;
    
    // 存储：用户地址 => 用户的所有 Blob IDs
    mapping(address => string[]) public userFiles;
    
    // 存储：Blob ID => 授权访问的地址列表
    mapping(string => mapping(address => bool)) public fileAccessPermissions;
    
    // 存储：用户地址 => 用户名/别名
    mapping(address => string) public userAliases;
    
    // 所有已上传的 Blob IDs（用于遍历）
    string[] public allBlobIds;
    
    // Events
    event FileUploaded(
        string indexed blobId,
        address indexed owner,
        string fileName,
        string fileType,
        uint256 fileSize,
        uint256 timestamp
    );
    
    event FileDeleted(
        string indexed blobId,
        address indexed owner,
        uint256 timestamp
    );
    
    event FileAccessGranted(
        string indexed blobId,
        address indexed owner,
        address indexed grantee,
        uint256 timestamp
    );
    
    event FileAccessRevoked(
        string indexed blobId,
        address indexed owner,
        address indexed revokee,
        uint256 timestamp
    );
    
    event FileVisibilityChanged(
        string indexed blobId,
        address indexed owner,
        bool isPublic,
        uint256 timestamp
    );
    
    event UserAliasSet(
        address indexed user,
        string alias,
        uint256 timestamp
    );
    
    // Errors
    error FileNotFound();
    error UnauthorizedAccess();
    error FileAlreadyExists();
    error InvalidBlobId();
    error InvalidFileName();
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @notice 上传文件引用到合约
     * @param blobId Walrus Blob ID
     * @param fileName 文件名称
     * @param fileType 文件类型
     * @param fileSize 文件大小（bytes）
     * @param isPublic 是否公开
     * @param metadata 额外元数据（JSON字符串）
     */
    function uploadFile(
        string memory blobId,
        string memory fileName,
        string memory fileType,
        uint256 fileSize,
        bool isPublic,
        string memory metadata
    ) external {
        if (bytes(blobId).length == 0) revert InvalidBlobId();
        if (bytes(fileName).length == 0) revert InvalidFileName();
        if (bytes(files[blobId].blobId).length != 0) revert FileAlreadyExists();
        
        // 创建文件记录
        files[blobId] = FileInfo({
            blobId: blobId,
            owner: msg.sender,
            fileName: fileName,
            fileType: fileType,
            fileSize: fileSize,
            uploadTime: block.timestamp,
            isPublic: isPublic,
            metadata: metadata
        });
        
        // 添加到用户文件列表
        userFiles[msg.sender].push(blobId);
        
        // 添加到全局列表
        allBlobIds.push(blobId);
        
        emit FileUploaded(
            blobId,
            msg.sender,
            fileName,
            fileType,
            fileSize,
            block.timestamp
        );
    }
    
    /**
     * @notice 批量上传文件引用
     * @param blobIds Blob ID 数组
     * @param fileNames 文件名数组
     * @param fileTypes 文件类型数组
     * @param fileSizes 文件大小数组
     * @param isPublicFlags 公开标志数组
     * @param metadataArray 元数据数组
     */
    function batchUploadFiles(
        string[] memory blobIds,
        string[] memory fileNames,
        string[] memory fileTypes,
        uint256[] memory fileSizes,
        bool[] memory isPublicFlags,
        string[] memory metadataArray
    ) external {
        require(
            blobIds.length == fileNames.length &&
            blobIds.length == fileTypes.length &&
            blobIds.length == fileSizes.length &&
            blobIds.length == isPublicFlags.length &&
            blobIds.length == metadataArray.length,
            "Array length mismatch"
        );
        
        for (uint256 i = 0; i < blobIds.length; i++) {
            if (bytes(files[blobIds[i]].blobId).length == 0) {
                files[blobIds[i]] = FileInfo({
                    blobId: blobIds[i],
                    owner: msg.sender,
                    fileName: fileNames[i],
                    fileType: fileTypes[i],
                    fileSize: fileSizes[i],
                    uploadTime: block.timestamp,
                    isPublic: isPublicFlags[i],
                    metadata: metadataArray[i]
                });
                
                userFiles[msg.sender].push(blobIds[i]);
                allBlobIds.push(blobIds[i]);
                
                emit FileUploaded(
                    blobIds[i],
                    msg.sender,
                    fileNames[i],
                    fileTypes[i],
                    fileSizes[i],
                    block.timestamp
                );
            }
        }
    }
    
    /**
     * @notice 删除文件引用（仅所有者）
     * @param blobId Walrus Blob ID
     */
    function deleteFile(string memory blobId) external {
        FileInfo storage file = files[blobId];
        
        if (bytes(file.blobId).length == 0) revert FileNotFound();
        if (file.owner != msg.sender) revert UnauthorizedAccess();
        
        // 从用户文件列表中移除
        _removeFromUserFiles(msg.sender, blobId);
        
        // 删除文件记录
        delete files[blobId];
        
        emit FileDeleted(blobId, msg.sender, block.timestamp);
    }
    
    /**
     * @notice 获取文件信息
     * @param blobId Walrus Blob ID
     * @return 文件信息结构
     */
    function getFileInfo(string memory blobId) external view returns (FileInfo memory) {
        FileInfo memory file = files[blobId];
        
        if (bytes(file.blobId).length == 0) revert FileNotFound();
        
        // 检查访问权限
        if (!file.isPublic && file.owner != msg.sender) {
            if (!fileAccessPermissions[blobId][msg.sender]) {
                revert UnauthorizedAccess();
            }
        }
        
        return file;
    }
    
    /**
     * @notice 获取用户的所有文件
     * @param user 用户地址
     * @return Blob ID 数组
     */
    function getUserFiles(address user) external view returns (string[] memory) {
        return userFiles[user];
    }
    
    /**
     * @notice 获取用户的文件详细信息
     * @param user 用户地址
     * @return 文件信息数组
     */
    function getUserFileInfos(address user) external view returns (FileInfo[] memory) {
        string[] memory blobIds = userFiles[user];
        FileInfo[] memory fileInfos = new FileInfo[](blobIds.length);
        
        for (uint256 i = 0; i < blobIds.length; i++) {
            fileInfos[i] = files[blobIds[i]];
        }
        
        return fileInfos;
    }
    
    /**
     * @notice 授予文件访问权限
     * @param blobId Walrus Blob ID
     * @param grantee 被授权者地址
     */
    function grantFileAccess(string memory blobId, address grantee) external {
        FileInfo storage file = files[blobId];
        
        if (bytes(file.blobId).length == 0) revert FileNotFound();
        if (file.owner != msg.sender) revert UnauthorizedAccess();
        
        fileAccessPermissions[blobId][grantee] = true;
        
        emit FileAccessGranted(blobId, msg.sender, grantee, block.timestamp);
    }
    
    /**
     * @notice 批量授予文件访问权限
     * @param blobId Walrus Blob ID
     * @param grantees 被授权者地址数组
     */
    function batchGrantFileAccess(string memory blobId, address[] memory grantees) external {
        FileInfo storage file = files[blobId];
        
        if (bytes(file.blobId).length == 0) revert FileNotFound();
        if (file.owner != msg.sender) revert UnauthorizedAccess();
        
        for (uint256 i = 0; i < grantees.length; i++) {
            fileAccessPermissions[blobId][grantees[i]] = true;
            emit FileAccessGranted(blobId, msg.sender, grantees[i], block.timestamp);
        }
    }
    
    /**
     * @notice 撤销文件访问权限
     * @param blobId Walrus Blob ID
     * @param revokee 被撤销者地址
     */
    function revokeFileAccess(string memory blobId, address revokee) external {
        FileInfo storage file = files[blobId];
        
        if (bytes(file.blobId).length == 0) revert FileNotFound();
        if (file.owner != msg.sender) revert UnauthorizedAccess();
        
        fileAccessPermissions[blobId][revokee] = false;
        
        emit FileAccessRevoked(blobId, msg.sender, revokee, block.timestamp);
    }
    
    /**
     * @notice 检查文件访问权限
     * @param blobId Walrus Blob ID
     * @param user 用户地址
     * @return 是否有访问权限
     */
    function hasFileAccess(string memory blobId, address user) external view returns (bool) {
        FileInfo memory file = files[blobId];
        
        if (bytes(file.blobId).length == 0) return false;
        
        // 所有者始终有访问权限
        if (file.owner == user) return true;
        
        // 公开文件任何人都可以访问
        if (file.isPublic) return true;
        
        // 检查是否被授权
        return fileAccessPermissions[blobId][user];
    }
    
    /**
     * @notice 设置文件可见性
     * @param blobId Walrus Blob ID
     * @param isPublic 是否公开
     */
    function setFileVisibility(string memory blobId, bool isPublic) external {
        FileInfo storage file = files[blobId];
        
        if (bytes(file.blobId).length == 0) revert FileNotFound();
        if (file.owner != msg.sender) revert UnauthorizedAccess();
        
        file.isPublic = isPublic;
        
        emit FileVisibilityChanged(blobId, msg.sender, isPublic, block.timestamp);
    }
    
    /**
     * @notice 更新文件元数据
     * @param blobId Walrus Blob ID
     * @param metadata 新的元数据
     */
    function updateFileMetadata(string memory blobId, string memory metadata) external {
        FileInfo storage file = files[blobId];
        
        if (bytes(file.blobId).length == 0) revert FileNotFound();
        if (file.owner != msg.sender) revert UnauthorizedAccess();
        
        file.metadata = metadata;
    }
    
    /**
     * @notice 设置用户别名
     * @param alias 用户别名
     */
    function setUserAlias(string memory alias) external {
        userAliases[msg.sender] = alias;
        emit UserAliasSet(msg.sender, alias, block.timestamp);
    }
    
    /**
     * @notice 获取所有公开文件
     * @return 公开文件的 Blob ID 数组
     */
    function getPublicFiles() external view returns (string[] memory) {
        uint256 publicCount = 0;
        
        // 计算公开文件数量
        for (uint256 i = 0; i < allBlobIds.length; i++) {
            if (files[allBlobIds[i]].isPublic) {
                publicCount++;
            }
        }
        
        // 创建结果数组
        string[] memory publicBlobIds = new string[](publicCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < allBlobIds.length; i++) {
            if (files[allBlobIds[i]].isPublic) {
                publicBlobIds[index] = allBlobIds[i];
                index++;
            }
        }
        
        return publicBlobIds;
    }
    
    /**
     * @notice 获取所有公开文件的详细信息
     * @return 公开文件信息数组
     */
    function getPublicFileInfos() external view returns (FileInfo[] memory) {
        string[] memory publicBlobIds = this.getPublicFiles();
        FileInfo[] memory publicFiles = new FileInfo[](publicBlobIds.length);
        
        for (uint256 i = 0; i < publicBlobIds.length; i++) {
            publicFiles[i] = files[publicBlobIds[i]];
        }
        
        return publicFiles;
    }
    
    /**
     * @notice 按文件类型搜索文件
     * @param fileType 文件类型
     * @param user 用户地址（如果为 address(0) 则搜索所有公开文件）
     * @return 匹配的 Blob ID 数组
     */
    function searchFilesByType(string memory fileType, address user) 
        external 
        view 
        returns (string[] memory) 
    {
        string[] memory searchPool;
        
        if (user == address(0)) {
            // 搜索所有公开文件
            searchPool = this.getPublicFiles();
        } else {
            // 搜索特定用户的文件
            searchPool = userFiles[user];
        }
        
        uint256 matchCount = 0;
        
        // 计算匹配数量
        for (uint256 i = 0; i < searchPool.length; i++) {
            if (keccak256(bytes(files[searchPool[i]].fileType)) == keccak256(bytes(fileType))) {
                matchCount++;
            }
        }
        
        // 创建结果数组
        string[] memory results = new string[](matchCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < searchPool.length; i++) {
            if (keccak256(bytes(files[searchPool[i]].fileType)) == keccak256(bytes(fileType))) {
                results[index] = searchPool[i];
                index++;
            }
        }
        
        return results;
    }
    
    /**
     * @notice 获取用户的存储统计
     * @param user 用户地址
     * @return fileCount 文件数量
     * @return totalSize 总大小（bytes）
     */
    function getUserStorageStats(address user) 
        external 
        view 
        returns (uint256 fileCount, uint256 totalSize) 
    {
        string[] memory blobIds = userFiles[user];
        fileCount = blobIds.length;
        totalSize = 0;
        
        for (uint256 i = 0; i < blobIds.length; i++) {
            totalSize += files[blobIds[i]].fileSize;
        }
        
        return (fileCount, totalSize);
    }
    
    /**
     * @notice 获取文件总数
     * @return 文件总数
     */
    function getTotalFileCount() external view returns (uint256) {
        return allBlobIds.length;
    }
    
    /**
     * @notice 内部函数：从用户文件列表中移除指定文件
     * @param user 用户地址
     * @param blobId Blob ID
     */
    function _removeFromUserFiles(address user, string memory blobId) private {
        string[] storage blobIds = userFiles[user];
        
        for (uint256 i = 0; i < blobIds.length; i++) {
            if (keccak256(bytes(blobIds[i])) == keccak256(bytes(blobId))) {
                // 将最后一个元素移到当前位置，然后删除最后一个
                blobIds[i] = blobIds[blobIds.length - 1];
                blobIds.pop();
                break;
            }
        }
    }
    
    /**
     * @notice 紧急提取（仅合约所有者）
     * @dev 用于紧急情况下的资金提取
     */
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    /**
     * @notice 接收 ETH/原生代币
     */
    receive() external payable {}
}
