/*
Auto-generated: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.5.3 public/Cat.gltf -t 
*/

import * as THREE from 'three'
import React, { useEffect, useRef } from 'react'
import { useGraph } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import { GLTF, SkeletonUtils } from 'three-stdlib'

type ActionName = 'Death' | 'Headbutt' | 'Idle' | 'Idle_Eating' | 'Jump_Loop' | 'Jump_Start' | 'Run' | 'Walk'

interface GLTFAction extends THREE.AnimationClip {
  name: ActionName
}

type GLTFResult = GLTF & {
  nodes: {
    Cat: THREE.SkinnedMesh
    All: THREE.Bone
    Root: THREE.Bone
  }
  materials: {
    Atlas: THREE.MeshStandardMaterial
  }
  animations: GLTFAction[]
}

type ModelProps = JSX.IntrinsicElements['group'] & {
  currentAction?: string;
}

export function Model({ currentAction = 'Run', ...props }: ModelProps) {
  const group = useRef<THREE.Group>(null)
  const { scene, animations } = useGLTF('/Cat.gltf')
  const clone = React.useMemo(() => SkeletonUtils.clone(scene), [scene])
  const { nodes, materials } = useGraph(clone) as GLTFResult
  const { actions } = useAnimations(animations, group)

  useEffect(() => {
    const actionToPlay = actions[currentAction] || actions['Run'] || actions['Idle'];

    if (actionToPlay) {
      actionToPlay.reset().fadeIn(0.2).play();
      return () => {
        actionToPlay.fadeOut(0.2);
      }
    }
  }, [currentAction, actions]);

  return (
    <group ref={group} {...props} dispose={null}>
      <group name="Scene">
        <group name="AnimalArmature">
          <primitive object={nodes.All} />
          <primitive object={nodes.Root} />
          <skinnedMesh name="Cat" geometry={nodes.Cat.geometry} material={materials.Atlas} skeleton={nodes.Cat.skeleton} />
        </group>
      </group>
    </group>
  )
}

useGLTF.preload('/Cat.gltf')
