<template>
  <q-card
    bordered
    flat
  >
    <q-item>
      <!-- Avatar/Username/Location section -->
      <q-item-section avatar>
        <q-skeleton
          animation="fade"
          size="40px"
          type="QAvatar"
        />
      </q-item-section>

      <q-item-section>
        <q-item-label>
          <q-skeleton
            animation="fade"
            type="text"
          />
        </q-item-label>
        <q-item-label caption>
          <q-skeleton
            animation="fade"
            type="text"
          />
        </q-item-label>
      </q-item-section>
    </q-item>

    <!-- Image section -->
    <q-skeleton
      animation="fade"
      height="200px"
      square
    />

    <!-- Caption/Date section -->
    <q-card-section>
      <q-skeleton
        class="text-subtitle2"
        animation="fade"
        type="text"
      />
      <q-skeleton
        class="text-subtitle2"
        animation="fade"
        type="text"
        width="50%"
      />
    </q-card-section>
  </q-card>
</template>

<script>
  export default {

  }
</script>
