<template>
  <q-item multiline>
    <q-item-side>
      <ProfilePicture
        :user="user"
        :size="40"
      />
    </q-item-side>
    <q-item-main>
      <q-item-tile>
        <q-field
          :error="hasAnyError"
          :error-label="anyFirstError"
        >
          <q-input
            type="textarea"
            rows="1"
            v-model="message"
            :placeholder="placeholder"
            :after="[{icon: 'arrow_forward', content: true, handler: this.send }]"
            :loading="isPending"
            @keyup.ctrl.enter="send"
          />
        </q-field>
      </q-item-tile>
    </q-item-main>
  </q-item>
</template>

<script>
import ProfilePicture from '@/components/ProfilePictures/ProfilePicture'
import { QItem, QItemMain, QInput, QField, QBtn, QItemSide, QItemTile } from 'quasar'
import statusMixin from '@/mixins/statusMixin'

export default {
  name: 'ConversationCompose',
  components: { QItem, QField, QInput, QBtn, QItemMain, QItemSide, QItemTile, ProfilePicture },
  mixins: [statusMixin],
  props: {
    placeholder: {
      type: String,
      default: 'placeholder',
    },
    user: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      message: '',
    }
  },
  methods: {
    send () {
      this.$emit('send', this.message)
      this.message = ''
    },
  },
}
</script>

<style scoped lang="stylus">
</style>
