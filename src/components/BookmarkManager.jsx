import { useEffect } from "react";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import ImportedBookmarks from "./ImportedBookmarks";
import {
  MdOutlineBookmarkAdd,
  MdOutlineCreateNewFolder,
  MdOutlineDriveFileMove,
} from "react-icons/md";
import {
  FaChevronDown,
  FaRegBookmark,
  FaRegFolder,
  FaRegTrashAlt,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { LuImport } from "react-icons/lu";
import { BiExport } from "react-icons/bi";
import { HiArrowNarrowLeft, HiArrowNarrowRight } from "react-icons/hi";

function BookmarkManager() {
  const [folders, setFolders] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [newFolderName, setNewFolderName] = useState(""); // Folder name state
  const [newBookmarkName, setNewBookmarkName] = useState("");
  const [newBookmarkURL, setNewBookmarkURL] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  // Tab management
  const [activeTab, setActiveTab] = useState("folders");

  // Modal states
  const [isAddBookmarkModalOpen, setIsAddBookmarkModalOpen] = useState(false);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false); // State for folder modal
  const [isMoveBookmarkModalOpen, setIsMoveBookmarkModalOpen] = useState(false);
  const [selectedBookmark, setSelectedBookmark] = useState(null);
  const [importedBookmarks, setImportedBookmarks] = useState([]);
  const [isImportView, setIsImportView] = useState(false); // To toggle between bookmark views
  const [tempSelectedFolderId, setTempSelectedFolderId] = useState(null); // For storing the selected folder temporarily
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] =
    useState(false);
  const [itemToDelete, setItemToDelete] = useState(null); // For storing the ID of the item to delete

  // Load bookmarks and folders from localStorage on component mount
  useEffect(() => {
    const storedFolders = JSON.parse(localStorage.getItem("folders")) || [];
    const storedBookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [];

    // Ensure data is set only if the localStorage contains valid data
    if (storedFolders.length) {
      setFolders(storedFolders);
    }
    if (storedBookmarks.length) {
      setBookmarks(storedBookmarks);
    }
  }, []);

  // Add a new folder
  const addFolder = () => {
    if (newFolderName.trim() !== "") {
      setFolders([
        ...folders,
        { id: uuidv4(), name: newFolderName, bookmarks: [] },
      ]);

      // set folders in localstorage to keep track of bookmarks in localStorage
      localStorage.setItem(
        "folders",
        JSON.stringify([
          ...folders,
          { id: uuidv4(), name: newFolderName, bookmarks: [] },
        ])
      );
      setNewFolderName(""); // Clear input field after adding
      setIsCreateFolderModalOpen(false); // Close modal after adding
    }
  };

  // Add a new bookmark
  const addBookmark = (folderId) => {
    const bookmark = {
      id: uuidv4(),
      title: newBookmarkName,
      url: newBookmarkURL,
    };

    if (folderId) {
      const updatedFolders = folders.map((folder) => {
        if (folder.id === folderId) {
          return { ...folder, bookmarks: [...folder.bookmarks, bookmark] };
        }
        return folder;
      });
      setFolders(updatedFolders);
      // set folders in localstorage to keep track of bookmarks in localStorage
      localStorage.setItem("folders", JSON.stringify(updatedFolders));
    } else {
      setBookmarks([...bookmarks, bookmark]);
      // set bookmarks in localstorage to keep track of bookmarks in localStorage
      localStorage.setItem(
        "bookmarks",
        JSON.stringify([...bookmarks, bookmark])
      );
    }

    // Close modal and reset inputs
    setIsAddBookmarkModalOpen(false);
    setNewBookmarkName("");
    setNewBookmarkURL("");
  };

  // Move a bookmark to another folder (from both main and imported bookmarks)
  const moveBookmarkToFolder = (folderId) => {
    if (selectedBookmark) {
      const updatedFolders = folders.map((folder) => {
        if (folder.id === folderId) {
          return {
            ...folder,
            bookmarks: [...folder.bookmarks, selectedBookmark],
          };
        }
        return folder;
      });
      setFolders(updatedFolders);
      //  update the folders in localstorage to keep track of bookmarks in localStorage
      localStorage.setItem("folders", JSON.stringify(updatedFolders));

      // Remove from unorganized bookmarks or imported bookmarks
      setBookmarks(
        bookmarks.filter((bookmark) => bookmark.id !== selectedBookmark.id)
      );

      //  update the bookmarks in localstorage to keep track of bookmarks in localStorage
      localStorage.setItem(
        "bookmarks",
        JSON.stringify(
          bookmarks.filter((bookmark) => bookmark.id !== selectedBookmark.id)
        )
      );

      setSelectedBookmark(null);
      setIsMoveBookmarkModalOpen(false);
    }
  };

  // Search bookmarks
  const searchBookmarks = (items) => {
    return items.filter((item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const handleFolderClick = (folder) => {
    setCurrentFolder(folder);
  };

  const resetToHome = () => {
    setCurrentFolder(null);
  };

  const exportBookmarks = () => {
    const data = JSON.stringify({ folders, bookmarks });
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "bookmarks.json";
    link.click();
  };
  const goBackToManager = () => {
    setIsImportView(false); // Switch back to bookmark manager view
  };

  const importBookmarks = (e) => {
    const file = e.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const importedData = JSON.parse(event.target.result);

        const bookmarks = [];
        const folders = [];

        importedData.forEach((item) => {
          if (item.type === "link") {
            bookmarks.push(item);
          } else if (item.type === "folder") {
            const folder = {
              ...item,
              children: item.children || [],
            };
            folders.push(folder);
          }
        });

        setImportedBookmarks(bookmarks); // Set imported bookmarks
        setIsImportView(true); // Switch to imported bookmarks view
      };
      reader.readAsText(file);
    }
  };

  // Delete a bookmark
  const deleteBookmark = (bookmarkId, folderId = null) => {
    if (folderId) {
      const updatedFolders = folders.map((folder) => {
        if (folder.id === folderId) {
          return {
            ...folder,
            bookmarks: folder.bookmarks.filter(
              (bookmark) => bookmark.id !== bookmarkId
            ),
          };
        }
        return folder;
      });
      setFolders(updatedFolders);
      localStorage.setItem("folders", JSON.stringify(updatedFolders));
    } else {
      const updatedBookmarks = bookmarks.filter(
        (bookmark) => bookmark.id !== bookmarkId
      );
      setBookmarks(updatedBookmarks);
      localStorage.setItem("bookmarks", JSON.stringify(updatedBookmarks));
    }
  };

  const cancelFolderSelection = () => {
    setTempSelectedFolderId(null);
    setIsMoveBookmarkModalOpen(false);
  };

  // Delete a folder
  const deleteFolder = (folderId) => {
    const updatedFolders = folders.filter((folder) => folder.id !== folderId);
    setFolders(updatedFolders);
    localStorage.setItem("folders", JSON.stringify(updatedFolders));
  };
  console.log("folders: ", folders);
  return (
    <div className="container mx-auto p-8">
      {isImportView ? (
        <ImportedBookmarks
          bookmarks={importedBookmarks}
          goBack={goBackToManager}
          setSelectedBookmark={setSelectedBookmark}
          setIsMoveBookmarkModalOpen={setIsMoveBookmarkModalOpen}
        />
      ) : (
        <>
          {!currentFolder ? (
            <>
              <h1 className="text-2xl font-semibold mb-6 text-center">
                Bookmark Manager
              </h1>

              {/* Search Bar */}
              <input
                type="text"
                className="border border-gray-200 h-12 rounded-lg px-4 py-2 mb-4 w-full focus:outline-none"
                placeholder="Search bookmarks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              {/* Buttons */}
              <div className="grid grid-cols-2 gap-4 mb-6 max-[517px]:grid-cols-1">
                <button
                  onClick={() => setIsAddBookmarkModalOpen(true)}
                  className="border border-gray-200 h-14 font-medium text-gray-600 rounded-lg px-4 py-2 hover:bg-gray-100 flex items-center gap-2 justify-center"
                >
                  <MdOutlineBookmarkAdd className="w-6 h-6" />
                  Add Bookmark
                </button>
                <button
                  onClick={() => setIsCreateFolderModalOpen(true)} // Open modal for creating folder
                  className="border border-gray-200 h-14 font-medium text-gray-600 rounded-lg px-4 py-2 hover:bg-gray-100 flex items-center gap-2 justify-center"
                >
                  <MdOutlineCreateNewFolder className="w-6 h-6" />
                  Create Folder
                </button>
                <button
                  onClick={exportBookmarks}
                  className="border border-gray-200 h-14 font-medium text-gray-600 rounded-lg px-4 py-2 hover:bg-gray-100 flex items-center gap-2 justify-center"
                >
                  <BiExport className="w-6 h-6" />
                  Export Bookmarks (JSON)
                </button>
                <label className="border border-gray-200 h-14 font-medium text-gray-600 rounded-lg px-4 py-2 hover:bg-gray-100 flex items-center gap-2 justify-center">
                  <LuImport className="w-6 h-6" />
                  Import Bookmarks (JSON)
                  <input
                    type="file"
                    className="hidden"
                    onChange={importBookmarks}
                  />
                </label>
              </div>
              <hr className="my-8" />
              {/* tabs */}
              <div className="flex my-4 border-b">
                <button
                  className={`py-2 px-4 border font-medium h-12 rounded-ss-md border-gray-200  w-full flex items-center justify-center gap-2 ${
                    activeTab === "folders" ? "bg-gray-100" : ""
                  }`}
                  onClick={() => setActiveTab("folders")}
                >
                  <FaRegFolder />
                  Folders
                </button>
                <button
                  className={`py-2 px-4 w-full h-12 font-medium border border-gray-200 rounded-se-md flex items-center justify-center gap-2 ${
                    activeTab === "bookmarks" ? "bg-gray-100" : ""
                  }`}
                  onClick={() => setActiveTab("bookmarks")}
                >
                  <FaRegBookmark />
                  Bookmarks
                </button>
              </div>

              {/* Folder Tab Content */}
              {activeTab === "folders" && (
                <>
                  {folders.length === 0 ? (
                    <p className="text-gray-600">No folders created yet</p>
                  ) : (
                    <ul className="space-y-4">
                      {folders.map((folder, index) => (
                        <li
                          key={index}
                          className="py-2 px-4 border border-gray-200 w-full rounded-md flex justify-between items-center gap-3 hover:bg-gray-100"
                        >
                          <button
                            onClick={() => setCurrentFolder(folder)}
                            className="font-semibold text-gray-700 text-start text-lg w-full"
                          >
                            {folder.name}
                          </button>
                          <button
                            onClick={() => deleteFolder(folder.id)}
                            className="bg-red-100 text-red-500 p-2 rounded-md hover:underline"
                          >
                            <FaRegTrashAlt />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}

              {activeTab === "bookmarks" && (
                <ul>
                  {bookmarks.length === 0 ? (
                    <li className="text-gray-600">No bookmarks created yet</li>
                  ) : (
                    searchBookmarks(bookmarks).map((bookmark, index) => (
                      <li
                        key={index}
                        className="py-2 border-b flex justify-between"
                      >
                        <Link
                          to={bookmark.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-700 font-medium hover:underline "
                        >
                          {bookmark.title}
                        </Link>
                        <div className="flex gap-3 items-center">
                          <button
                            onClick={() => {
                              setSelectedBookmark(bookmark);
                              setIsMoveBookmarkModalOpen(true);
                            }}
                            className="bg-emerald-100 text-emerald-500 rounded-md p-2 hover:underline"
                          >
                            <MdOutlineDriveFileMove className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() =>
                              deleteBookmark(
                                bookmark.id,
                                currentFolder ? currentFolder.id : null
                              )
                            }
                            className="bg-red-100 text-red-500 p-2 rounded-md hover:underline"
                          >
                            <FaRegTrashAlt />
                          </button>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              )}
            </>
          ) : (
            <div>
              <button
                onClick={resetToHome}
                className="text-gray-500 mb-4 font-medium hover:underline flex items-center gap-1"
              >
                <HiArrowNarrowLeft className="w-5 h-5" /> Back
              </button>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-1 text-gray-700">
                Folder <HiArrowNarrowRight />
                {currentFolder.name}
              </h2>

              {/* List Bookmarks in Folder */}
              <ul>
                {searchBookmarks(currentFolder.bookmarks).map((bookmark) => (
                  <li
                    key={bookmark.id}
                    className="py-2 border-b flex justify-between items-center"
                  >
                    <Link
                      to={bookmark.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-700 font-medium hover:underline "
                    >
                      {bookmark.title}
                    </Link>
                    {/* <button
                      onClick={() =>
                        deleteBookmark(
                          bookmark.id,
                          currentFolder ? currentFolder.id : null
                        )
                      }
                      className="bg-red-100 text-red-500 p-2 rounded-md hover:underline"
                    >
                      <FaRegTrashAlt />
                    </button> */}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Add Bookmark Modal */}
          {isAddBookmarkModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded-md shadow-lg w-80">
                <h3 className="text-lg font-semibold mb-4">Add New Bookmark</h3>
                <input
                  type="text"
                  className="border border-gray-300 outline-none rounded-md px-4 py-2 mb-4 w-full"
                  placeholder="Bookmark Name"
                  value={newBookmarkName}
                  onChange={(e) => setNewBookmarkName(e.target.value)}
                />
                <input
                  type="text"
                  className="border border-gray-300 outline-none rounded-md px-4 py-2 mb-4 w-full"
                  placeholder="Bookmark URL"
                  value={newBookmarkURL}
                  onChange={(e) => setNewBookmarkURL(e.target.value)}
                />
                <button
                  onClick={() =>
                    addBookmark(currentFolder ? currentFolder.id : null)
                  }
                  className="bg-emerald-400 text-white py-2 px-4 rounded-md hover:bg-emerald-500"
                >
                  Add Bookmark
                </button>
                <button
                  onClick={() => setIsAddBookmarkModalOpen(false)}
                  className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 ml-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Create Folder Modal */}
          {isCreateFolderModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded-md shadow-lg w-80">
                <h3 className="text-lg font-semibold mb-4">
                  Create New Folder
                </h3>
                <input
                  type="text"
                  className="border border-gray-300 outline-none rounded-md h-12 px-4 py-2 mb-4 w-full"
                  placeholder="Folder Name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                />
                <button
                  onClick={addFolder}
                  className="bg-emerald-400 text-white py-2 px-4 rounded-md hover:bg-emerald-500"
                >
                  Create Folder
                </button>
                <button
                  onClick={() => setIsCreateFolderModalOpen(false)}
                  className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 ml-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </>
      )}
      {/* Move Bookmark Modal */}
      {isMoveBookmarkModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-md p-6 w-80">
            <h2 className="text-xl font-semibold mb-4">Move Bookmark</h2>

            <h3 className="mb-2">Choose a folder:</h3>
            <ul className="flex flex-col gap-2 h-28 overflow-y-auto">
              {folders.length > 0 ? (
                folders.map((folder) => (
                  <li
                    key={folder.id}
                    className="flex justify-between items-center border border-gray-200 px-4 py-2 rounded-md"
                  >
                    <span>{folder.name}</span>
                    <button
                      onClick={() => setTempSelectedFolderId(folder.id)}
                      className={`ml-2 text-sm font-medium ${
                        tempSelectedFolderId === folder.id
                          ? "text-emerald-500"
                          : "text-gray-500"
                      }`}
                    >
                      {tempSelectedFolderId === folder.id
                        ? "Selected"
                        : "Select"}
                    </button>
                  </li>
                ))
              ) : (
                <p className="text-gray-600 text-sm">No folders created yet</p>
              )}
            </ul>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => moveBookmarkToFolder(tempSelectedFolderId)}
                className="bg-emerald-400 text-white py-2 px-4 rounded-md hover:bg-emerald-500"
                disabled={!tempSelectedFolderId}
              >
                Move
              </button>
              <button
                onClick={cancelFolderSelection}
                className="bg-gray-200 hover:bg-gray-300 text-black rounded px-4 py-2 ml-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {isConfirmDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-md shadow-lg w-80">
            <h3 className="text-lg font-bold mb-4">Confirm Delete</h3>
            <p>Are you sure you want to delete this item?</p>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => {
                  // Call delete function based on the type of item
                  if (currentFolder) {
                    deleteFolder(itemToDelete);
                  } else {
                    deleteBookmark(
                      itemToDelete,
                      currentFolder ? currentFolder.id : null
                    );
                  }
                  setIsConfirmDeleteModalOpen(false);
                  setItemToDelete(null); // Clear the item to delete
                }}
                className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 mr-2"
              >
                Delete
              </button>
              <button
                onClick={() => {
                  setIsConfirmDeleteModalOpen(false);
                  setItemToDelete(null); // Clear the item to delete
                }}
                className="bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookmarkManager;
