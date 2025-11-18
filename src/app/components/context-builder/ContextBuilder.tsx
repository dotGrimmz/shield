import React, { useState } from 'react';
import { motion } from 'motion/react';
import { BookOpen, User, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { Card } from '../common/Card';
import styles from './ContextBuilder.module.css';

interface Node {
  id: string;
  type: 'scripture' | 'claim' | 'theologian' | 'counterclaim';
  label: string;
  description: string;
  x: number;
  y: number;
}

interface Connection {
  from: string;
  to: string;
}

const mockData = {
  nodes: [
    {
      id: 'scripture-1',
      type: 'scripture' as const,
      label: 'Matthew 5:17-18',
      description: 'Jesus came to fulfill the Law, not abolish it',
      x: 20,
      y: 20,
    },
    {
      id: 'scripture-2',
      type: 'scripture' as const,
      label: 'Romans 10:4',
      description: 'Christ is the end of the law for righteousness',
      x: 20,
      y: 200,
    },
    {
      id: 'claim-1',
      type: 'claim' as const,
      label: 'Law & Grace',
      description: 'Grace fulfills the Law, it does not erase it',
      x: 300,
      y: 110,
    },
    {
      id: 'theologian-1',
      type: 'theologian' as const,
      label: 'Augustine',
      description: 'The New Testament is concealed in the Old',
      x: 580,
      y: 50,
    },
    {
      id: 'counterclaim-1',
      type: 'counterclaim' as const,
      label: 'Objection',
      description: 'Christians cherry-pick Old Testament laws',
      x: 580,
      y: 170,
    },
  ],
  connections: [
    { from: 'scripture-1', to: 'claim-1' },
    { from: 'scripture-2', to: 'claim-1' },
    { from: 'claim-1', to: 'theologian-1' },
    { from: 'claim-1', to: 'counterclaim-1' },
  ],
};

export const ContextBuilder: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'scripture':
        return BookOpen;
      case 'theologian':
        return User;
      case 'counterclaim':
        return AlertCircle;
      case 'claim':
        return CheckCircle;
      default:
        return Info;
    }
  };

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'scripture':
        return '#FFD700'; // Gold
      case 'theologian':
        return '#10B981'; // Emerald
      case 'counterclaim':
        return '#B91C1C'; // Crimson
      case 'claim':
        return '#0B132B'; // Navy
      default:
        return '#6B7280';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <header className={styles.header}>
          <div className={styles.deprecation}>
            <strong>Deprecated Feature:</strong> This visualization is archived and no longer maintained. Please rely on the core lessons and notes experience for current apologetics study paths.
          </div>
          <h1>Context Builder (Deprecated)</h1>
          <p>Visualize the relationships between Scripture, claims, and theological insights</p>
        </header>

        <div className={styles.mainLayout}>
          <Card className={styles.diagramCard}>
            <div className={styles.diagram}>
              <svg className={styles.connections}>
                {mockData.connections.map((conn, index) => {
                  const fromNode = mockData.nodes.find(n => n.id === conn.from);
                  const toNode = mockData.nodes.find(n => n.id === conn.to);
                  if (!fromNode || !toNode) return null;

                  return (
                    <motion.line
                      key={index}
                      x1={fromNode.x + 75}
                      y1={fromNode.y + 40}
                      x2={toNode.x + 75}
                      y2={toNode.y + 40}
                      stroke="var(--border-color)"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                    />
                  );
                })}
              </svg>

              {mockData.nodes.map((node, index) => {
                const Icon = getNodeIcon(node.type);
                return (
                  <motion.div
                    key={node.id}
                    className={`${styles.node} ${selectedNode?.id === node.id ? styles.selectedNode : ''}`}
                    style={{
                      left: `${node.x}px`,
                      top: `${node.y}px`,
                    }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setSelectedNode(node)}
                  >
                    <div 
                      className={styles.nodeIcon}
                      style={{ background: getNodeColor(node.type) }}
                    >
                      <Icon size={20} color="white" />
                    </div>
                    <div className={styles.nodeContent}>
                      <div className={styles.nodeLabel}>{node.label}</div>
                      <div className={styles.nodeType}>{node.type}</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </Card>

          {selectedNode && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className={styles.sidebar}
            >
              <Card>
                <div className={styles.detailHeader}>
                  <div 
                    className={styles.detailIcon}
                    style={{ background: getNodeColor(selectedNode.type) }}
                  >
                    {React.createElement(getNodeIcon(selectedNode.type), { 
                      size: 24, 
                      color: 'white' 
                    })}
                  </div>
                  <div>
                    <h3>{selectedNode.label}</h3>
                    <span className={styles.detailType}>{selectedNode.type}</span>
                  </div>
                </div>
                <p className={styles.detailDescription}>{selectedNode.description}</p>
              </Card>
            </motion.div>
          )}
        </div>

        <div className={styles.legend}>
          <h3>Legend</h3>
          <div className={styles.legendItems}>
            {[
              { type: 'scripture', label: 'Scripture Reference' },
              { type: 'claim', label: 'Theological Claim' },
              { type: 'theologian', label: 'Theologian Insight' },
              { type: 'counterclaim', label: 'Objection' },
            ].map(item => (
              <div key={item.type} className={styles.legendItem}>
                <div 
                  className={styles.legendColor}
                  style={{ background: getNodeColor(item.type) }}
                />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
