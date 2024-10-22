import React from "react";
import { HiArrowNarrowLeft } from "react-icons/hi";
import { MdOutlineDriveFileMove } from "react-icons/md";
import { Link } from "react-router-dom";

const ImportedBookmarks = ({
  bookmarks,
  goBack,
  setSelectedBookmark,
  setIsMoveBookmarkModalOpen,
}) => {
  return (
    <div className="container mx-auto p-8 max-[496px]:px-4">
      <button
        onClick={goBack}
        className="text-gray-500 mb-4 font-medium hover:underline flex items-center gap-1"
      >
        <HiArrowNarrowLeft className="w-5 h-5" />
        Back
      </button>
      <h1 className="text-2xl font-semibold mb-6">Imported Bookmarks</h1>

      <ul>
        {bookmarks.map((bookmark, index) => (
          <li
            key={index}
            className="py-2 border-b flex justify-between items-center gap-5"
          >
            <Link
              to={bookmark.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 font-medium hover:underline w-4/5"
            >
              {bookmark.title.length > 80
                ? `${bookmark.title.substring(0, 80)}...`
                : bookmark.title}
            </Link>
            <button
              onClick={() => {
                setSelectedBookmark(bookmark);
                setIsMoveBookmarkModalOpen(true);
              }}
              className="bg-emerald-100 text-emerald-500 rounded-md p-2 hover:underline"
            >
              <MdOutlineDriveFileMove className="w-5 h-5" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ImportedBookmarks;
