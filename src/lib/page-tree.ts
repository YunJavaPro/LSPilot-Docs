import type { Folder, Item, Node, Root } from 'fumadocs-core/page-tree';

const folderIndexLinks = new Map<string, Item>([
  [
    'services/meta.json',
    {
      $id: 'services-introduction-index',
      type: 'page',
      name: 'Services',
      url: '/services/introduction',
    },
  ],
]);

function applyFolderIndexLinks(nodes: Node[]) {
  for (const node of nodes) {
    if (node.type !== 'folder') continue;

    const linkedIndex = node.$ref ? folderIndexLinks.get(node.$ref) : undefined;

    if (linkedIndex) {
      node.index = { ...linkedIndex };
    }

    const index = node.children.find(
      (child): child is Item => child.type === 'page' && linkedIndex?.url === child.url,
    );

    if (index) {
      node.index = { ...index };
    }

    applyFolderIndexLinks(node.children);
  }
}

export function preparePageTree<T extends Root | Folder>(tree: T): T {
  const prepared = {
    ...tree,
    children: tree.children.filter((node) => !(node.type === 'page' && node.url === '/')),
  };

  applyFolderIndexLinks(prepared.children);
  return prepared;
}
