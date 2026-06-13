<template>
  <i :class="iconClass" :style="iconStyle" @mouseover="handleMouseOver" @mouseout="handleMouseOut"></i>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  name: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2x' | '3x' | '5x' | '7x' | '10x'
  color?: string
  spin?: boolean
  pulse?: boolean
  flip?: 'horizontal' | 'vertical' | 'both'
  rotation?: 90 | 180 | 270
  bounce?: boolean
  shake?: boolean
  animationSpeed?: 'slow' | 'fast'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  spin: false,
  pulse: false,
  bounce: false,
  shake: false,
  animationSpeed: 'fast'
})

const isHovered = ref(false)

const iconClass = computed(() => {
  const classes = ['fas']

  // Mapping custom icon names to Font Awesome icons
  const iconMap: Record<string, string> = {
    'bolt': 'fa-bolt',
    'box': 'fa-box',
    'truck': 'fa-truck',
    'check-circle': 'fa-check-circle',
    'money': 'fa-money-bill-wave',
    'shield': 'fa-shield-alt',
    'wrench': 'fa-wrench',
    'thumbs-up': 'fa-thumbs-up',
    'star': 'fa-star',
    'heart': 'fa-heart',
    'arrow-down': 'fa-arrow-down',
    'arrow-up': 'fa-arrow-up',
    'search': 'fa-search',
    'cart': 'fa-shopping-cart',
    'user': 'fa-user',
    'cog': 'fa-cog',
    'home': 'fa-home',
    'phone': 'fa-phone',
    'envelope': 'fa-envelope',
    'map-marker': 'fa-map-marker-alt',
    'clock': 'fa-clock',
    'certificate': 'fa-certificate',
    'industry': 'fa-industry',
    'cube': 'fa-cube',
    'tag': 'fa-tag',
    'percent': 'fa-percent',
    'comments': 'fa-comments',
    'thumbs-down': 'fa-thumbs-down',
    'eye': 'fa-eye',
    'download': 'fa-download',
    'upload': 'fa-upload',
    'sync': 'fa-sync',
    'times': 'fa-times',
    'plus': 'fa-plus',
    'minus': 'fa-minus',
    'edit': 'fa-edit',
    'trash': 'fa-trash',
    'save': 'fa-save',
    'print': 'fa-print',
    'camera': 'fa-camera',
    'image': 'fa-image',
    'film': 'fa-film',
    'music': 'fa-music',
    'power-off': 'fa-power-off',
    'refresh': 'fa-refresh',
    'lock': 'fa-lock',
    'unlock': 'fa-unlock',
    'key': 'fa-key',
    'sitemap': 'fa-sitemap',
    'chart-bar': 'fa-chart-bar',
    'bell': 'fa-bell',
    'calendar': 'fa-calendar',
    'flag': 'fa-flag',
    'book': 'fa-book',
    'bookmark': 'fa-bookmark',
    'briefcase': 'fa-briefcase',
    'headset': 'fa-headset',
  }

  const iconName = iconMap[props.name] || props.name

  classes.push(iconName)

  if (props.size && props.size !== 'md') {
    classes.push(`fa-${props.size}`)
  }

  if (props.spin) {
    classes.push('fa-spin')
  }

  if (props.pulse) {
    classes.push('fa-pulse')
  }

  if (props.flip) {
    classes.push(`fa-flip-${props.flip}`)
  }

  if (props.rotation) {
    classes.push(`fa-rotate-${props.rotation}`)
  }

  if (props.bounce) {
    classes.push('fa-bounce')
  }

  if (props.shake) {
    classes.push('fa-shake')
  }

  // Add hover animation class if needed
  if (isHovered.value) {
    classes.push('fa-beat')
  }

  return classes
})

const iconStyle = computed(() => {
  const style: Record<string, string> = {}
  
  if (props.color) {
    style.color = props.color
  }
  
  if (props.animationSpeed === 'slow') {
    style['--fa-animation-duration'] = '2s'
  } else if (props.animationSpeed === 'fast') {
    style['--fa-animation-duration'] = '0.5s'
  }
  
  return style
})

const handleMouseOver = () => {
  isHovered.value = true
}

const handleMouseOut = () => {
  isHovered.value = false
}
</script>

<style scoped>
.fas {
  transition: transform 0.3s ease;
}

.fas:hover {
  /* Additional hover effect if needed */
}
</style>