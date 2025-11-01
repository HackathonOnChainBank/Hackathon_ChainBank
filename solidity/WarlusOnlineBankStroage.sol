// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract WalrusOnlineBankStorage {
    struct FileInfo {
        string dataId;   // Walrus 回傳的 dataId
        string proof;    // Walrus 回傳的 proof
        string fileType; // 檔案類型(string, image, video, etc.)
        uint256 timestamp;
    }

    // 改為 mapping(address => FileInfo[]) 來支援多個檔案
    mapping(address => FileInfo[]) public userFiles;

    event FileStored(
        address indexed user, 
        string dataId, 
        string proof, 
        string fileType, 
        uint256 timestamp,
        uint256 fileIndex
    );

    /**
     * @dev 儲存新檔案
     * @param dataId Walrus 回傳的 dataId
     * @param proof Walrus 回傳的 proof
     * @param fileType 檔案類型
     */
    function storeFile(string memory dataId, string memory proof, string memory fileType) external {
        FileInfo memory newFile = FileInfo({
            dataId: dataId,
            proof: proof,
            fileType: fileType,
            timestamp: block.timestamp
        });
        
        userFiles[msg.sender].push(newFile);
        uint256 fileIndex = userFiles[msg.sender].length - 1;
        
        emit FileStored(msg.sender, dataId, proof, fileType, block.timestamp, fileIndex);
    }

    /**
     * @dev 取得用戶的檔案數量
     * @param user 用戶地址
     * @return 檔案數量
     */
    function getFileCount(address user) external view returns (uint256) {
        return userFiles[user].length;
    }

    /**
     * @dev 取得用戶的特定檔案
     * @param user 用戶地址
     * @param index 檔案索引
     * @return FileInfo 檔案資訊
     */
    function getFile(address user, uint256 index) external view returns (FileInfo memory) {
        require(index < userFiles[user].length, "File index out of bounds");
        return userFiles[user][index];
    }

    /**
     * @dev 取得用戶的所有檔案
     * @param user 用戶地址
     * @return FileInfo[] 所有檔案
     */
    function getAllFiles(address user) external view returns (FileInfo[] memory) {
        return userFiles[user];
    }

    /**
     * @dev 取得用戶最新的檔案
     * @param user 用戶地址
     * @return FileInfo 最新檔案
     */
    function getLatestFile(address user) external view returns (FileInfo memory) {
        require(userFiles[user].length > 0, "No files found");
        return userFiles[user][userFiles[user].length - 1];
    }
}