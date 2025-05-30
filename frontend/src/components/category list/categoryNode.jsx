import { useState } from "react";

const CategoryNode = ({ node, onSelectCategory }) => {
  const [expanded, setExpanded] = useState(false);
  const isLeaf = !node.children || node.children.length === 0;

  const handleClick = () => {
    if (isLeaf) {
      onSelectCategory(node);
    } else {
      setExpanded(prev => !prev);
    }
  };

  return (
    <li>
      <div
        onClick={handleClick}
        className={`cursor-pointer p-2 rounded text-sm flex items-center justify-between ${
          isLeaf ? "hover:bg-gray-700" : "font-bold"
        }`}
      >
        {node.name}
        {!isLeaf && (
          <span className="text-xs ml-2">{expanded ? "▾" : "▸"}</span>
        )}
      </div>

      {!isLeaf && expanded && (
        <ul className="pl-4 mt-1 space-y-1">
          {node.children.map(child => (
            <CategoryNode
              key={child.id}
              node={child}
              onSelectCategory={onSelectCategory}
            />
          ))}
        </ul>
      )}
    </li>
  );
};
  export default CategoryNode;