class PickupManageController {
  constructor($locale, $mdDialog, $document, $stateParams, PickupDate, PickupDateSeries) {
    "ngInject";
    Object.assign(this, {
      $locale,
      $mdDialog,
      $document,
      $stateParams,
      PickupDate,
      PickupDateSeries,
      days: {}
    });

    this.keys = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
    this.dayLookup = {};
    for (let i = 0; i < 7; i++) {
      this.dayLookup[this.keys[i]] = i;
    }
  }

  $onInit() {
    angular.forEach(this.series, (s) => {
      // expand pickups for series per default
      s.$expanded = true;

      // handle old creation behavior where byDay can be undefined
      // -> can be removed after a while
      if (angular.isUndefined(s.rule.byDay)) {
        s.rule.byDay = [this.keys[s.start_date.getDay()]];
      }
    });
  }

  getDayNames(series) {
    return series.rule.byDay.map((d) => this.$locale.DATETIME_FORMATS.DAY[this.dayLookup[d]]);
  }

  getSinglePickups() {
    return this.pickups.filter((p) => !p.series);
  }

  getPickupsInSeries(series) {
    return this.pickups.filter((p) => p.series === series.id);
  }

  reloadPickupsInSeries(series) {
    this.PickupDate.listBySeriesId(series.id).then((pickups) => {
      this.deletePickupsInSeries(series);
      angular.forEach(pickups, (p) => {
        this.pickups.push(p);
      });
    });
  }

  deletePickupsInSeries(series) {
    angular.forEach(this.getPickupsInSeries(series), (pickup) => {
      let i = this.pickups.indexOf(pickup);
      this.pickups.splice(i, 1);
    });
  }

  hasCollectors(pickup) {
    return pickup.collector_ids.length > 0;
  }

  toggle(series) {
    series.$expanded = !series.$expanded;
  }

  openEditCreatePanel($event, config) {
    let DialogController = function (data) {
      "ngInject";
      this.data = data;
    };

    this.$mdDialog.show({
      parent: this.$document.body,
      targetEvent: $event,
      template: "<pickup-edit-create data='$ctrl.data'></pickup-edit-create>",
      locals: {
        data: {
          storeId: this.$stateParams.storeId,
          series: config.series,
          editData: angular.copy(config.data)
        }
      },
      controller: DialogController,
      controllerAs: "$ctrl"
    }).then((data) => {
      let isSeries = config.series;
      if (angular.isUndefined(isSeries)) {
        // detect a series through missing date
        if (angular.isUndefined(data.date)) {
          isSeries = true;
        } else {
          isSeries = false;
        }
      }
      if (isSeries) {
        data.$expanded = true;
        this.reloadPickupsInSeries(data);
      }
      if (config.data) {
        // edited, update entry
        angular.copy(data, config.data);
      } else {
        // new entry, add to list
        if (isSeries) {
          this.series.push(data);
        } else {
          this.pickups.push(data);
        }
      }
    }).catch(() => {});
  }

  openDeletePanel($event, config) {
    return this.$mdDialog.show({
      contentElement: "#confirmDeleteDialog",
      parent: angular.element(this.$document.body),
      targetEvent: $event
    }).then(() => {
      if (config.series) {
        return this.PickupDateSeries.delete(config.data.id);
      } else {
        return this.PickupDate.delete(config.data.id);
      }
    }).then(() => {
      if (config.series) {
        let i = this.series.indexOf(config.data);
        this.series.splice(i, 1);
        this.deletePickupsInSeries(config.data);
      } else {
        let i = this.pickups.indexOf(config.data);
        this.pickups.splice(i, 1);
      }
    }).catch(() => {});
  }
}

export default PickupManageController;
